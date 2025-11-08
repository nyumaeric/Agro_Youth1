"use client";

import { JitsiMeeting } from "@jitsi/react-sdk";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";

interface JitsiMeetingModalProps {
  session: {
    id: string;
    title: string;
    description: string;
    scheduledAt: string;
  };
  onClose: () => void;
}

export default function JitsiMeetingModal({ session, onClose }: JitsiMeetingModalProps) {
  const { data: userSession } = useSession();
  const userName = userSession?.user?.fullName || "Guest User";
  
  // Create unique room name from session ID
  const roomName = `AgroYouth-${session.id}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 p-4 ">
      

      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-200">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {formatDate(session.scheduledAt)} at {formatTime(session.scheduledAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Close meeting"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 relative overflow-hidden bg-black">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={roomName}
            configOverwrite={{
              startWithAudioMuted: true,
              startWithVideoMuted: false,
              disableModeratorIndicator: false,
              startScreenSharing: false,
              enableEmailInStats: false,
              prejoinPageEnabled: true,
              enableWelcomePage: false,
              enableClosePage: false,
              disableProfile: true,
              disableInviteFunctions: false,
              hideConferenceSubject: false,
              subject: session.title,
              defaultLanguage: 'en',
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              TOOLBAR_BUTTONS: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'fodeviceselection',
                'hangup',
                'chat',
                'recording',
                'sharedvideo',
                'settings',
                'raisehand',
                'videoquality',
                'filmstrip',
                'tileview',
              ],
              SETTINGS_SECTIONS: ['devices', 'language'],
              FILM_STRIP_MAX_HEIGHT: 120,
              MOBILE_APP_PROMO: false,
            }}
            userInfo={{
              displayName: userName,
              email: (userSession?.user && 'email' in userSession.user ? (userSession.user as { email?: string }).email || '' : ''),
            }}
            onApiReady={(externalApi) => {
              console.log("Jitsi API Ready for room:", roomName);
              // Add event listeners
              externalApi.on('videoConferenceJoined', () => {
                console.log('User joined the conference');
              });

              externalApi.on('videoConferenceLeft', () => {
                console.log('User left the conference');
                onClose();
              });

              externalApi.on('readyToClose', () => {
                console.log('Meeting is ready to close');
                onClose();
              });
            }}
            getIFrameRef={(iframeRef) => {
              if (iframeRef) {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
              }
            }}
          />
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-emerald-50 border-t border-emerald-200">
          <p className="text-sm text-emerald-800 text-center">
            🎥 You're in a secure Jitsi meeting room. Your video call is encrypted end-to-end.
          </p>
        </div>
      </div>
    </div>
  );
}