"use client";

const Page = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <audio hidden id="remoteAudio" autoPlay></audio>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          No Contact Selected
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a contact from the list to start messaging
        </p>
      </div>
    </div>
  );
};

export default Page;
