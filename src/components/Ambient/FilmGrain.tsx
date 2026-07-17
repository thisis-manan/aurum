import styles from './Ambient.module.css'

/** Full-page cinematic film grain overlay. Sits above everything, ignores pointer events. */
export default function FilmGrain() {
  return <div className={styles.grain} aria-hidden="true" />
}
