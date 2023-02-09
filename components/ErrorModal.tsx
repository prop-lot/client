import React from "react";

const ErrorModal: React.FC<{
  title?: string;
  content?: React.ReactNode;
  onDismiss: () => void;
}> = (props) => {
  const { title, content, onDismiss } = props;
  return (
    <div className="min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"  style={{backgroundImage: "url(https://images.unsplash.com/photo-1623600989906-6aae5aa131d4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1582&q=80);"}} id="modal-id">
      <div onClick={onDismiss} className="absolute bg-black opacity-80 inset-0 z-0"></div>
      <div className="w-full  max-w-lg p-5 relative mx-auto my-auto rounded-xl shadow-lg  bg-white ">
        <div className="">
          <div className="text-center p-5 flex-auto justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 flex items-center text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-xl font-bold py-4 ">{title}</h2>
            <p className="text-sm text-gray-500 px-8">{content}</p>    
          </div>
          <div className="p-3  mt-2 text-center space-x-4 md:block">
              <button onClick={onDismiss} className="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100">
                  Close
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
