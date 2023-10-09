import { useEffect } from 'react';
import VodPlayer from '../components/VodPlayer';

function Archive() {
  useEffect(() => {
    const videoJs = document.querySelector('video');
    videoJs.style.backgroundColor = '#37436d';
  }, []);

  return (
    <>
      <div className=" bg-oc-space-blue h-screen w-full flex flex-col items-center">
        <h1 className=" text-oc-cold-white font-bold text-3xl text-center p-12">Stream Archive</h1>
        <div className=" flex flex-col h-4/5 w-4/5 justify-center">
          <VodPlayer></VodPlayer>
        </div>
      </div>
    </>
  );
}

export default Archive;
