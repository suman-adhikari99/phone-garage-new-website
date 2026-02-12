"use client"

import { Star, Quote } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "iPhone 15 Pro Max",
    text: "Absolutely brilliant service! My cracked screen was replaced in under an hour and looks brand new. The team was professional and transparent about pricing. Highly recommend Phone Garage!",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Samsung Galaxy S24",
    text: "My Samsung had serious water damage and I thought it was done for. The team at Phone Garage recovered everything, including all my photos. Amazing work!",
    rating: 5,
  },
  {
    name: "Emily Robertson",
    role: "Google Pixel 8",
    text: "Fast, friendly and very affordable. They replaced my battery in 20 minutes while I grabbed a coffee. My phone lasts all day again. Will definitely be back if I ever need anything.",
    rating: 5,
  },
  {
    name: "Michael Torres",
    role: "iPhone 14",
    text: "The charging port on my iPhone stopped working. Phone Garage had it fixed same day at a fraction of what Apple quoted me. Fantastic customer service too!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "OPPO Find X5",
    text: "I was worried about getting my OPPO repaired since not many places service them. Phone Garage had the parts and fixed my screen perfectly. Great experience overall.",
    rating: 5,
  },
  {
    name: "David O'Connor",
    role: "Samsung Galaxy Z Flip",
    text: "Even my foldable phone wasn't a problem for these guys. The inner screen had a crack and they sorted it out beautifully. Top-notch skill and very reasonable pricing.",
    rating: 5,
  },
]

export function Testimonials() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.05)

  return (
    <section
      id="testimonials"
      className="relative bg-background py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`mb-16 text-center transition-all duration-700 ${
            headerVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Testimonials
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            What Our <span className="text-primary">Customers Say</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            We take pride in every repair. Here is what our happy customers have
            to say about their experience with Phone Garage.
          </p>
        </div>

        {/* Testimonials grid */}
        <div
          ref={gridRef}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary/20 hover:shadow-md ${
                gridVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: gridVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Quote icon */}
              <Quote className="mb-4 h-8 w-8 text-primary/20" />

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#3CB043] text-[#3CB043]"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                {`"${testimonial.text}"`}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-card-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
