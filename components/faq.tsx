"use client"

import { useEffect, useState } from "react"
import { faqs } from "@/lib/data"
import { cn } from "@/lib/utils"

const FAQ_FOOTER_SPACER_EXTRA = 0

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const [footerSpacer, setFooterSpacer] = useState(0)

  useEffect(() => {
    const updateFooterSpacer = () => {
      const footer = document.getElementById("site-footer")
      setFooterSpacer(footer ? footer.getBoundingClientRect().height + FAQ_FOOTER_SPACER_EXTRA : FAQ_FOOTER_SPACER_EXTRA)
    }

    updateFooterSpacer()
    window.addEventListener("resize", updateFooterSpacer)

    const footer = document.getElementById("site-footer")
    const observer = footer ? new ResizeObserver(updateFooterSpacer) : null
    if (footer && observer) {
      observer.observe(footer)
    }

    return () => {
      window.removeEventListener("resize", updateFooterSpacer)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  return (
    <div className="relative z-10">
      <section id="faq" className="relative">
      <div className="bg-[#040404] pt-[120px] pb-20 max-[999px]:pt-20">
        <div className="mx-auto w-full max-w-[1200px] px-4 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl text-balance">
              Frequently Asked Questions
            </h2>
          </div>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className={cn(
                  "mb-[18px] rounded-2xl border p-5 transition-all duration-300 sm:p-6",
                  isOpen
                    ? "border-[#3a3a3a]/70 bg-[#111111] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.7)]"
                    : "border-[#262626] bg-[#0b0b0b] hover:border-[#4a4a4a]"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className={cn(
                    "group flex w-full items-center justify-between text-left transition-all duration-300",
                    isOpen
                      ? "text-white"
                      : "text-white hover:text-[#d9d9d9]"
                  )}
                  aria-expanded={isOpen}
                >
                  <span className="text-[19px] font-semibold leading-tight">
                    {faq.question}
                  </span>
                  <span className="relative ml-[15px] inline-block h-[14px] w-[14px] shrink-0">
                    <span
                      className={cn(
                        "absolute top-[6px] left-0 h-[2px] w-[14px] rounded-[2px] transition-colors duration-300",
                        isOpen
                          ? "bg-white"
                          : "bg-white group-hover:bg-white"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute top-[6px] left-0 h-[2px] w-[14px] rounded-[2px] transition-all duration-300",
                        isOpen
                          ? "rotate-0 bg-white"
                          : "rotate-90 bg-white group-hover:bg-white"
                      )}
                    />
                  </span>
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen
                      ? "max-h-[5000px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="mt-4 rounded-xl border border-[#3a3a3a] bg-[#111111] px-4 py-4 sm:px-5">
                    <p className="text-[17px] leading-relaxed text-[#e5e5e5]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        id="contact"
        className="rounded-b-[60px] bg-[#040404] pb-[50px] max-[689px]:py-[60px]"
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 lg:px-8">
          <div className="grid gap-[50px] lg:grid-cols-2 lg:gap-[25px]">
            <div className="rounded-[30px] border-[3px] border-dashed border-[#3a3a3a] p-[35px] max-[689px]:p-[30px]">
              <h2 className="mb-5 max-w-[500px] text-[36px] font-semibold text-white max-[999px]:text-[30px] max-[689px]:text-center max-[689px]:text-[25px]">
                Contact us at :
              </h2>

              <div className="mb-[10px] flex items-start gap-[25px]">
                <div className="pt-[15px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-[34px] w-[34px] min-w-[34px] fill-white"
                    aria-hidden="true"
                  >
                    <path d="M14.465 1.481a1.01 1.01 0 0 1 1.122-.898c1.93.215 3.738 1.115 5.227 2.602 1.485 1.483 2.386 3.29 2.602 5.227a1.016 1.016 0 1 1-2.02.227c-.166-1.473-.863-2.862-2.019-4.015-1.16-1.158-2.548-1.856-4.015-2.02a1.016 1.016 0 0 1-.897-1.123Zm.237 5.154c.73.142 1.364.454 1.787.876.423.423.734 1.058.876 1.787a1.018 1.018 0 0 0 1.996-.39c-.155-.793-.53-1.93-1.435-2.834-.904-.906-2.04-1.28-2.834-1.434a1.017 1.017 0 1 0-.39 1.996Zm9.235 12.676c-.389 2.099-2.473 3.59-2.929 3.892-.587.42-1.45.797-2.647.797-2.357 0-6.016-1.456-11.46-6.9v-.001C-1.313 8.886-.45 4.736.795 2.993 1.1 2.537 2.587.454 4.688.064c1.12-.208 2.228.102 3.2.899 3.976 3.275 3.607 5.128 2.772 7.044-.5 1.146-.83 1.904 1.342 3.952 2.192 2.069 3.038 1.713 4.107 1.263 1.915-.806 3.64-1.105 6.927 2.89.8.974 1.11 2.08.902 3.2Zm-2.472-1.91c-2.587-3.139-3.417-2.79-4.568-2.306-1.654.695-3.377 1.09-6.291-1.659-2.967-2.797-2.55-4.549-1.81-6.242.51-1.172.913-2.097-2.2-4.66-.495-.407-.987-.564-1.502-.478-1.228.204-2.36 1.667-2.597 2.048-.436.617-1.981 3.734 5.841 11.558 7.824 7.824 10.944 6.277 11.488 5.888a.817.817 0 0 1 .088-.057c.364-.227 1.826-1.36 2.03-2.587.085-.515-.071-1.006-.48-1.505Z" />
                  </svg>
                </div>
                <div className="self-center">
                  <h5 className="m-0 text-base font-semibold text-white">
                    Phone:
                  </h5>
                  <a
                    href="tel:0295252986"
                    className="font-bold text-white transition-colors hover:text-[#d9d9d9]"
                  >
                    (02) 9525 2986
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-[25px]">
                <div className="pt-[15px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-[34px] w-[34px] min-w-[34px] fill-white"
                    aria-hidden="true"
                  >
                    <path d="M23.878 9.493a3.38 3.38 0 0 0-.528-1.097c-.272-.375-.595-.634-1.181-1.103l-6.87-5.501C14.377 1.054 13.87.648 13.21.459a3.403 3.403 0 0 0-1.784-.024c-.666.17-1.184.562-2.125 1.274L1.937 7.277c-.62.47-.963.728-1.249 1.108A3.397 3.397 0 0 0 .13 9.507C0 9.964 0 10.393 0 11.172v7.617c0 1.478 0 2.292.372 3.022a3.4 3.4 0 0 0 1.49 1.491c.73.37 1.542.37 3.018.37h14.24c1.475 0 2.287 0 3.017-.37a3.39 3.39 0 0 0 1.491-1.492C24 21.081 24 20.27 24 18.794v-7.702c0-.746 0-1.158-.122-1.599ZM10.455 3.236c.744-.563 1.153-.873 1.446-.947.256-.066.527-.062.783.01.289.083.69.405 1.419.987l6.785 5.434-7.132 5.386c-.71.521-1.1.808-1.381.88a1.516 1.516 0 0 1-.75 0c-.279-.071-.669-.357-1.37-.872l-7.098-5.36 7.298-5.518Zm11.631 15.558c0 1.14 0 1.827-.163 2.148a1.496 1.496 0 0 1-.655.654c-.32.163-1.007.163-2.148.163H4.88c-1.141 0-1.83 0-2.148-.163a1.489 1.489 0 0 1-.655-.654c-.163-.32-.163-1.01-.163-2.153v-7.617c0-.439 0-.735.021-.942l7.12 5.374c.018.016.04.033.06.047.9.66 1.396 1.025 2.03 1.19.56.143 1.15.144 1.71-.001.637-.166 1.133-.53 2.044-1.199l7.17-5.414c.017.195.017.47.017.865v7.702Z" />
                  </svg>
                </div>
                <div className="self-center">
                  <h5 className="m-0 text-base font-semibold text-white">
                    Email:
                  </h5>
                  <a
                    href="mailto:info@phonegarage.com.au"
                    className="font-bold text-white transition-colors hover:text-[#d9d9d9]"
                  >
                    info@phonegarage.com.au
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-[30px] p-[35px] max-[689px]:items-center max-[689px]:p-[30px]">
              <h2 className="mb-3 max-w-[500px] text-[36px] font-semibold text-white max-[999px]:text-[30px] max-[689px]:text-center max-[689px]:text-[25px]">
                Have more questions?
              </h2>
              <p className="mb-3 text-[18px] text-[#ffffffd1] max-[999px]:text-base max-[689px]:text-center">
                Feel free to write to us or just call for more information.
              </p>
              <a
                href="https://phonegarage.com.au/form/1564/"
                rel="noopener"
                className="inline-flex items-center gap-[15px] self-start text-base text-white underline transition-colors hover:text-[#d9d9d9] max-[689px]:self-center"
              >
                <span>Write to us</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 40 40"
                  className="h-[30px] w-[30px] min-w-[30px] fill-current"
                  aria-hidden="true"
                >
                  <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0Zm8.65 19.999V20.017a.65.65 0 0 1-.055.246c-.002.002-.001.002-.001.003h-.001v.002a.662.662 0 0 1-.128.187l-.002.001-6.857 7a.646.646 0 0 1-.919.008.65.65 0 0 1-.009-.92l5.775-5.894H12a.65.65 0 0 1 0-1.3h14.453l-5.775-5.895a.65.65 0 0 1 .928-.91l6.857 6.999.002.001c.055.056.097.12.128.187v.002l.002.002.007.016a.65.65 0 0 1 .047.231l.001.014v.002Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      </section>
      <div aria-hidden style={{ height: `${footerSpacer}px` }} />
    </div>
  )
}
