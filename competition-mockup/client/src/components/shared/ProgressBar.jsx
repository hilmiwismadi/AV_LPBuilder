import React from "react";

const ProgressBar = ({ currentStep, steps }) => {
  return (
    <div className="w-full">
      <div className="stepper-container">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                {/* Step Pill */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-accent text-primary-dark'
                      : index === currentStep
                      ? 'bg-accent text-primary-dark scale-110'
                      : 'bg-white/30 text-white/60'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {/* Step Label */}
                <span
                  className={`text-xs mt-2.5 font-medium transition-all duration-300 ${
                    index <= currentStep ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-all duration-300 ${
                    index < currentStep ? 'bg-accent' : 'bg-white/30'
                  }`}
                  style={{ maxWidth: '80px' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
