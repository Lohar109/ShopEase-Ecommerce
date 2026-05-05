import React from 'react';
import { Check } from 'lucide-react';
import './Stepper.css';

const Stepper = ({ steps = ['Cart', 'Shipping', 'Order Summary', 'Payment'], currentStep = 1 }) => {
  return (
    <nav className="stepper" aria-label="Checkout steps">
      {steps.map((label, idx) => {
        const stepIndex = idx + 1;
        const isCompleted = stepIndex < currentStep;
        const isActive = stepIndex === currentStep;

        return (
          <React.Fragment key={label}>
            <div className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              <span className="step-circle" aria-hidden>
                {isCompleted ? <Check size={14} color="#16a34a" /> : <span className="step-number">{stepIndex}</span>}
              </span>
              <span className="step-label">{label}</span>
            </div>

            {idx < steps.length - 1 && (
              <span className={`step-connector ${stepIndex < currentStep ? 'connector-complete' : stepIndex === currentStep ? 'connector-active' : 'connector-upcoming'}`} aria-hidden />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Stepper;
