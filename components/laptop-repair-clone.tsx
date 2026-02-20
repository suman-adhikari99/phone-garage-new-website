"use client"

import Image from "next/image"
import styles from "@/styles/laptop-repair-clone.module.css"

export function LaptopRepairCloneSection() {
  const goToLaptopBrandSelection = () => {
    window.dispatchEvent(
      new CustomEvent("services:go-to-step", {
        detail: { device: "laptop", step: 2 },
      })
    )
  }

  return (
    <section className={styles.section}>
      <nav className={styles.nav}>
        <div className={styles.navLogo} />
      </nav>

      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <Image
            className={styles.laptopImg}
            src="/macbook-clone.png"
            alt="MacBook internal hardware"
            width={1280}
            height={1024}
            priority
          />
        </div>

        <div className={styles.heroRight}>
          <h1>Laptop Repair</h1>

            <svg className={styles.signatureLine} viewBox="0 0 250 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="scribble-g" x1="0" y1="0" x2="250" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#111111" />
                  <stop offset="52%" stopColor="#111111" />
                  <stop offset="82%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              <path
                className={styles.sigPath}
                d="M 10,14 C 48,8 98,9 138,11 C 176,13 214,12 246,8"
                stroke="url(#scribble-g)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <h2>Fast, Reliable &amp; Affordable Fix for All Brands</h2>
            <p className={styles.desc}>
              From cracked screens to dead batteries, we diagnose and fix all laptop issues - same day, with a 90-day warranty.
            </p>

            <div className={styles.services}>
              <p className={styles.servicesTitle}>Our Laptop Repair Services</p>
              <ul className={styles.servicesList}>
                <li>Display &amp; Screen Repair</li>
                <li>Battery &amp; Charging Repair</li>
                <li>Storage, OS &amp; Data Safety</li>
                <li>Motherboard &amp; Board-Level Repair</li>
                <li>Cooling &amp; Thermal Performance</li>
                <li>Hinge, Body &amp; Keyboard Repair</li>
              </ul>
            </div>

          <button className={styles.cta} type="button" onClick={goToLaptopBrandSelection}>
            Book a Repair Now
          </button>
        </div>
      </div>
    </section>
  )
}
