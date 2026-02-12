"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const faqs = [
  {
    question: "What types of devices do you repair?",
    answer:
      "We repair smartphones, tablets, laptops, MacBooks, smartwatches, and gaming consoles from all major brands including Apple, Samsung, Google, Huawei, OPPO, OnePlus, Xiaomi, and more.",
  },
  {
    question: "How long does a typical repair take?",
    answer:
      "Most common repairs like screen replacements and battery swaps are completed within 30-60 minutes. More complex repairs such as water damage or motherboard issues may take 1-24 hours. We always aim for same-day service.",
  },
  {
    question: "Do you offer a warranty on repairs?",
    answer:
      "Yes! All our repairs come with a 6-month warranty covering parts and labour. If the same issue recurs within the warranty period, we will fix it at no additional cost.",
  },
  {
    question: "Do I need to make an appointment?",
    answer:
      "No appointment is necessary. Walk-ins are welcome during our business hours. However, you can also get a quote online and schedule a convenient time if you prefer.",
  },
  {
    question: "Do you use original parts for repairs?",
    answer:
      "We offer both genuine OEM parts and high-quality aftermarket alternatives. We always discuss the options with you so you can choose based on your preference and budget.",
  },
  {
    question: "Is my data safe during the repair?",
    answer:
      "We take customer privacy very seriously. Our technicians focus only on the repair itself and do not access personal data. However, we always recommend backing up your device beforehand as a precaution.",
  },
  {
    question: "What is your 'No Fix, No Fee' policy?",
    answer:
      "If we diagnose your device and determine that it cannot be repaired, you will not be charged a single cent. We believe in honest service and transparent pricing.",
  },
  {
    question: "Can I mail in my device for repair?",
    answer:
      "Yes! If you cannot visit our store in person, you can securely mail your device to us. We will repair it and ship it back to you, fully insured and tracked.",
  },
]

export function FAQ() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation(0.05)

  return (
    <section id="faq" className="relative bg-secondary/30 py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`mb-12 text-center transition-all duration-700 ${
            headerVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            FAQ
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Frequently Asked{" "}
            <span className="text-primary">Questions</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Got questions? We have answers. If you do not find what you are
            looking for, feel free to contact us directly.
          </p>
        </div>

        {/* Accordion */}
        <div
          ref={faqRef}
          className={`transition-all duration-700 ${
            faqVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-border bg-card px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-card-foreground hover:text-primary hover:no-underline py-4 sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
