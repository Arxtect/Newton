/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-26 09:42:55
 */
import React from 'react';
import Spinner from './spinner';

const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

const buttonVariants = {
  primary: 'btn-primary',
  warning: 'btn-warning',
  secondary: 'btn-secondary',
  'secondary-accent': 'btn-secondary-accent',
  ghost: 'btn-ghost',
  tertiary: 'btn-tertiary',
};

const buttonSizes = {
  small: 'btn-small',
  medium: 'btn-medium',
  large: 'btn-large',
};

const Button = React.forwardRef(({
  className,
  variant = 'secondary',
  size = 'medium',
  loading,
  styleCss,
  children,
  ...props
}, ref) => {
  const variantClass = buttonVariants[variant] || buttonVariants.secondary;
  const sizeClass = buttonSizes[size] || buttonSizes.medium;

  return (
    <button
      type="button"
      className={classNames('btn', variantClass, sizeClass, 'disabled:btn-disabled', className)}
      ref={ref}
      style={styleCss}
      {...props}
    >
      {children}
      {loading && <Spinner loading={loading} className="!text-white !h-3 !w-3 !border-2 !ml-1" />}
    </button>
  );
});


export default Button;
