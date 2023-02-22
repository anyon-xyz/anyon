import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  width?: "auto" | string;
  className?: React.ComponentProps<"div">["className"];
  onSaveSubmit?: () => void;
}

export const Modal = ({
  title,
  children,
  showModal,
  setShowModal,
  width = "auto",
  className,
  description,
  onSaveSubmit,
}: ModalProps) => {
  return (
    <AnimatePresence>
      {showModal && (
        <>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.75,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                ease: "easeOut",
                duration: 0.2,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.75,
              transition: {
                ease: "easeIn",
                duration: 0.2,
              },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
          >
            <div
              className={`relative my-6 mx-auto ${width} max-w-3xl ${
                className || ""
              }`}
            >
              {/*content*/}
              <div className="relative flex w-full flex-col rounded-lg border-0 bg-black text-white shadow-lg outline-none focus:outline-none">
                {/*header*/}
                <div className="flex flex-col items-start justify-between rounded-t border-b border-solid border-slate-700 p-5">
                  <h3 className="text-3xl font-semibold">
                    {title || "Register"}
                  </h3>
                  {description && (
                    <p className="mt-2 font-light text-gray-300">
                      {description}
                    </p>
                  )}
                </div>
                {/*body*/}
                {children}
                {/*footer*/}
                <div className="flex items-center justify-end rounded-b border-t border-solid border-slate-700 p-6">
                  {onSaveSubmit && (
                    <button
                      className="text-white-500 mr-1 mb-1 rounded bg-green-700 px-6 py-2 text-sm font-bold uppercase outline-none transition-all duration-150 ease-linear hover:bg-green-900 focus:outline-none"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        onSaveSubmit();
                      }}
                    >
                      Save
                    </button>
                  )}
                  <button
                    className="background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </>
      )}
    </AnimatePresence>
  );
};
