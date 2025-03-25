import { useState } from 'react';

const InfoButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center focus:outline-none"
        aria-label="Information"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">About</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Developer</h3>
                <p>Tao Li</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Product Manager Accelerator</h3>
                <p className="text-gray-700 mb-4">
                  The Product Manager Accelerator is a program designed to help aspiring 
                  product managers develop the skills and knowledge needed to succeed in 
                  the field. The program offers mentorship, training, and real-world 
                  experience to help participants launch their careers in product management.
                </p>
                <p className="text-gray-700">
                  Learn more at{' '}
                  <a
                    href="https://www.linkedin.com/school/pmaccelerator/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn: Product Manager Accelerator
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoButton; 