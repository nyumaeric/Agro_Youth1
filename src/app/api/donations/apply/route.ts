import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { sendResponse } from '@/utils/response';
import db from '@/server/db';
import { donationApplications } from '@/server/db/schema';
import { getUserIdFromSession } from '@/utils/getUserIdFromSession';
import { eq } from 'drizzle-orm';
import { uploadCertificates } from '@/utils/cloudinary';

// export async function POST(req: NextRequest) {
//   try {
//     const userId = await getUserIdFromSession();
    
//     if (!userId) {
//       return sendResponse(401, null, 'Unauthorized');
//     }

//     const formData = await req.formData();
    
//     const projectTitle = formData.get('projectTitle') as string;
//     const organization = formData.get('organization') as string;
//     const projectDescription = formData.get('projectDescription') as string;
//     const projectGoals = formData.get('projectGoals') as string;
//     const budgetAmount = formData.get('budgetAmount') as string;
//     const duration = formData.get('duration') as string;
//     const expectedImpact = formData.get('expectedImpact') as string;
//     const projectId = formData.get('projectId') as string;  
//     const email = formData.get('email') as string

//     if (!projectTitle || !projectDescription || !projectGoals || !budgetAmount || !duration || !expectedImpact || !projectId) {
//       return sendResponse(400, null, 'Missing required fields');

//     }

//     const certificates = formData.getAll('certificates') as File[];
//     const uploadedFiles: string[] = [];

//     if (certificates.length === 0) {
//       return sendResponse(400, null, 'At least one certificate is required');
//     }

//     const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
//     await mkdir(uploadDir, { recursive: true });

//     for (const file of certificates) {
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);
      
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;
//       const filepath = path.join(uploadDir, filename);
      
//       await writeFile(filepath, buffer);
//       uploadedFiles.push(`/uploads/certificates/${filename}`);
//     }

//     const [application] = await db
//       .insert(donationApplications)
//       .values({
//         projectId,
//         userId,
//         projectTitle,
//         organization: organization || null,
//         projectDescription,
//         projectGoals,
//         budgetAmount: parseInt(budgetAmount),
//         duration,
//         email,
//         expectedImpact,
//         certificates: uploadedFiles,
//         status: 'pending',
//       })
//       .returning();

//     return sendResponse(200, application, 'Application submitted successfully');
//   } catch (error) {
//     console.error('Error submitting application:', error);
//     const errorMessage = error instanceof Error ? error.message : 'An error occurred';
//     return sendResponse(500, null, errorMessage);
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const userId = await getUserIdFromSession();
//     if (!userId) {
//       return sendResponse(401, null, 'Unauthorized');
//     }

//     const formData = await req.formData();
    
//     const projectTitle = formData.get('projectTitle') as string;
//     const organization = formData.get('organization') as string;
//     const projectDescription = formData.get('projectDescription') as string;
//     const projectGoals = formData.get('projectGoals') as string;
//     const budgetAmount = formData.get('budgetAmount') as string;
//     const duration = formData.get('duration') as string;
//     const expectedImpact = formData.get('expectedImpact') as string;
//     const projectId = formData.get('projectId') as string;  
//     const email = formData.get('email') as string;
//     if (!projectTitle || !projectDescription || !projectGoals || !budgetAmount || !duration || !expectedImpact || !projectId || !email) {
//       return sendResponse(400, null, 'Missing required fields');
//     }

//     const certificates = formData.getAll('certificates') as File[];
    
//     if (certificates.length === 0) {
//       return sendResponse(400, null, 'At least one certificate is required');
//     }

//     const uploadedFiles: string[] = [];
//     const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
    
//     // Create directory if it doesn't exist
//     await mkdir(uploadDir, { recursive: true });

//     // Process each certificate file
//     for (const file of certificates) {
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);
      
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;
//       const filepath = path.join(uploadDir, filename);
      
//       await writeFile(filepath, buffer);
      
//       // FIX: This was the problematic line - use parentheses, not backticks
//       uploadedFiles.push(`/uploads/certificates/${filename}`);
//     }

//     // Insert into database
//     const [application] = await db
//       .insert(donationApplications)
//       .values({
//         projectId,
//         userId,
//         projectTitle,
//         organization: organization || null,
//         projectDescription,
//         projectGoals,
//         budgetAmount: parseInt(budgetAmount),
//         duration,
//         email,
//         expectedImpact,
//         certificates: uploadedFiles,
//         status: 'pending',
//       })
//       .returning();

//     return sendResponse(200, application, 'Application submitted successfully');
//   } catch (error) {
//     console.error('Error submitting application:', error);
//     const errorMessage = error instanceof Error ? error.message : 'An error occurred';
//     return sendResponse(500, null, errorMessage);
//   }
// }



export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, 'Unauthorized. Please log in to submit an application.');
    }

    // 2. Parse form data
    const formData = await req.formData();
    
    // Extract all fields
    const projectTitle = formData.get('projectTitle') as string;
    const organization = formData.get('organization') as string;
    const projectDescription = formData.get('projectDescription') as string;
    const projectGoals = formData.get('projectGoals') as string;
    const budgetAmount = formData.get('budgetAmount') as string;
    const duration = formData.get('duration') as string;
    const expectedImpact = formData.get('expectedImpact') as string;
    const projectId = formData.get('projectId') as string;
    const email = formData.get('email') as string;

    // 3. Validate required fields
    const missingFields: string[] = [];
    
    if (!projectTitle) missingFields.push('projectTitle');
    if (!projectDescription) missingFields.push('projectDescription');
    if (!projectGoals) missingFields.push('projectGoals');
    if (!budgetAmount) missingFields.push('budgetAmount');
    if (!duration) missingFields.push('duration');
    if (!expectedImpact) missingFields.push('expectedImpact');
    if (!projectId) missingFields.push('projectId');
    if (!email) missingFields.push('email');

    if (missingFields.length > 0) {
      return sendResponse(
        400, 
        null, 
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    // 4. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(400, null, 'Invalid email format');
    }

    // 5. Validate budget amount
    const budgetNum = parseInt(budgetAmount);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      return sendResponse(400, null, 'Budget amount must be a positive number');
    }

    // 6. Get and validate certificates
    const certificates = formData.getAll('certificates') as File[];
    
    if (certificates.length === 0) {
      return sendResponse(400, null, 'At least one certificate is required');
    }

    // Filter out empty files (in case of form submission issues)
    const validCertificates = certificates.filter(file => file.size > 0);
    
    if (validCertificates.length === 0) {
      return sendResponse(400, null, 'No valid certificate files found');
    }

    console.log(`Processing ${validCertificates.length} certificate(s)...`);

    // 7. Upload certificates to Cloudinary
    let uploadedFileUrls: string[];
    
    try {
      uploadedFileUrls = await uploadCertificates(validCertificates);
      console.log(`Successfully uploaded ${uploadedFileUrls.length} certificate(s)`);
    } catch (uploadError) {
      console.error('Certificate upload failed:', uploadError);
      const errorMsg = uploadError instanceof Error 
        ? uploadError.message 
        : 'Failed to upload certificates';
      return sendResponse(500, null, `Certificate upload error: ${errorMsg}`);
    }

    // 8. Insert application into database
    try {
      const [application] = await db
        .insert(donationApplications)
        .values({
          projectId,
          userId,
          projectTitle,
          organization: organization || null,
          projectDescription,
          projectGoals,
          budgetAmount: budgetNum,
          duration,
          email,
          expectedImpact,
          certificates: uploadedFileUrls, // Array of Cloudinary URLs
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log('Application submitted successfully:', application.id);

      // 9. Return success response
      return sendResponse(
        200,
        {
          applicationId: application.id,
          projectTitle: application.projectTitle,
          status: application.status,
          certificateCount: uploadedFileUrls.length,
          certificates: uploadedFileUrls
        },
        'Application submitted successfully! We will review it shortly.'
      );

    } catch (dbError) {
      
      return sendResponse(
        500,
        null,
        'Failed to save application. Please try again.'
      );
    }

  } catch (error) {
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    return sendResponse(500, null, `Server error: ${errorMessage}`);
  }
}

export async function GET(req: NextRequest) {
    try {
      const userId = await getUserIdFromSession();
      
      if (!userId) {
        return sendResponse(401, null, 'Unauthorized');
      }
  
      const applications = await db
        .select()
        .from(donationApplications)
        .where(eq(donationApplications.userId, userId))
        .orderBy(donationApplications.createdAt);
  
      return sendResponse(200, applications, 'Applications fetched successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return sendResponse(500, null, errorMessage);
    }
  }