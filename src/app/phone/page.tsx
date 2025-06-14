"use client";

const Page = () => {
  return (
    <div className="w-full h-full bg-gray-100">
      <audio hidden id="remoteAudio" autoPlay></audio>
      {/* <audio hidden id="localAudio" autoPlay></audio> */}
    </div>
  );
};

export default Page;
