import styles from "./Footer.module.css";
import { FaArrowRight, FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const instagramVideos = ["/videos/video1.mp4", "/videos/video2.mp4", "/videos/video3.mp4"];

const instagramCardClasses = [
  styles.instagramCardOne,
  styles.instagramCardTwo,
  styles.instagramCardThree,
];

export default function Footer() {
  return (
    <>
      <section className={styles.newsletterSection} aria-label="Newsletter">
        <div className={styles.newsletterMedia}>
          <form className={styles.newsletterContent} onSubmit={(event) => event.preventDefault()}>
            <div className={styles.newsletterCopy}>
              <p className={styles.newsletterEyebrow}>WANT SOME NEWS ?</p>
              <div className={styles.newsletterHeadingRow}>
                <label className={styles.srOnly} htmlFor="newsletter-email">Email address</label>
                <input
                  id="newsletter-email"
                  className={styles.newsletterInput}
                  type="email"
                  name="email"
                  placeholder="Join the club"
                  autoComplete="email"
                />
                <button className={styles.newsletterButton} type="submit" aria-label="Subscribe to the newsletter">
                  <FaArrowRight className={styles.newsletterArrow} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.newsletterRule} aria-hidden="true" />
            </div>
          </form>
        </div>
      </section>

      <section className={styles.instagramSection} aria-labelledby="instagram-heading">
        <div className={styles.container}>
          <div className={styles.instagramHeader}>
            <h2 id="instagram-heading" className={styles.instagramTitle}>
              <span>FOLLOW US ON</span>
              <span>INSTAGRAM</span>
            </h2>
          </div>

          <div className={styles.instagramGrid}>
            {instagramVideos.map((video, index) => (
              <figure
                key={video}
                className={`${styles.instagramCard} ${instagramCardClasses[index]}`}
              >
                <video
                  className={styles.instagramVideo}
                  src={video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

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
    </>
  );
}
