"use client";

import { Fragment, ReactNode } from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
  showCloseButton = true,
  closeOnOutsideClick = true,
}: DialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="relative z-50"
        onClose={closeOnOutsideClick ? onClose : () => {}}
      >
        {/* Background overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        {/* Dialog panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={`w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <HeadlessDialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    {title}
                  </HeadlessDialog.Title>
                  {showCloseButton && (
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mt-2">{children}</div>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
