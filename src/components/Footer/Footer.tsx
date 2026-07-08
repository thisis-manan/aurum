import styles from "./Footer.module.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>A</div>
              <span>AURUM</span>
            </div>

            <p className={styles.copyright}>
              © 2026 AURUM. All rights reserved.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h4>Pages</h4>
               <a href="#">All Products</a>
              <a href="#">Rings</a>
              <a href="#">Necklaces</a>
              <a href="#">Bracelets</a>
              <a href="#">Earrings</a>
            </div>

            <div className={styles.column}>
              <h4>Socials</h4>
              <a href="#">
                <FaFacebookF /> Facebook
              </a>
              <a href="#">
                <FaInstagram /> Instagram
              </a>
              <a href="#">
                <FaTwitter /> Twitter
              </a>
              <a href="#">
                <FaLinkedinIn /> LinkedIn
              </a>
            </div>

            <div className={styles.column}>
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>

            <div className={styles.column}>
              <h4>Register</h4>
              <a href="#">Sign Up</a>
              <a href="#">Login</a>
              <a href="#">Forgot Password</a>
            </div>
          </div>
        </div>

        <div className={styles.watermarkWrap} aria-hidden="true">
          <span className={styles.watermark}>AURUM</span>
        </div>
      </div>
    </footer>
  );
}