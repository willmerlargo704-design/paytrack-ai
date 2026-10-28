import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'medium', fullWidth, className = '', ...rest }) {
  return (
    <button className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}