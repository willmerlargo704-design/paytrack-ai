import styles from './Badge.module.css';

const COLORS = { gray: styles.gray, blue: styles.blue, green: styles.green, red: styles.red, amber: styles.amber };

export default function Badge({ children, color = 'gray' }) {
  return <span className={`${styles.badge} ${COLORS[color]}`}>{children}</span>;
}