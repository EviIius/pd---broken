import React from 'react';

interface StepperProps {
  currentStep: number;
}

const steps = ['Upload Data', 'Select Columns', 'Configure Model', 'View Results'];

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <div className="flex bg-secondary border border-border rounded-lg overflow-hidden mb-8">
      {steps.map((step, index) => (
        <div
          key={step}
          className={
            `flex-1 text-center py-2 text-base font-medium transition-colors ` +
            (index === currentStep
              ? 'bg-card text-primary shadow-sm border-b-2 border-primary' // Changed text-primary-foreground to text-primary
              : 'bg-transparent text-muted-foreground') // inactive steps use muted foreground
          }
          style={{
            borderRight: index < steps.length - 1 ? '1px solid hsl(var(--border))' : undefined // Use border color from theme
          }}
        >
          {step}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
