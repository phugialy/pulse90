import type { Metadata } from "next";
import { ClosingExperience } from "@/components/closing-experience";

export const metadata: Metadata = {
  title: "Pulse90 Final Whistle | World Cup Watch Desk Archive",
  description:
    "Pulse90 was a World Cup watch desk for fixtures, standings, teams, and match context. The live app is retired and preserved as an interactive archive by Phugialy.",
  keywords: [
    "Pulse90",
    "World Cup watch desk",
    "World Cup fixtures app",
    "interactive sports website",
    "3D website design",
    "Phugialy",
    "custom website design",
  ],
  openGraph: {
    title: "Pulse90 Final Whistle",
    description:
      "A retired World Cup watch desk preserved as an interactive archive and portfolio artifact by Phugialy.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://pulse90.loxys.co/#website",
        name: "Pulse90 Final Whistle",
        url: "https://pulse90.loxys.co",
        description:
          "Pulse90 was a World Cup watch desk for fixtures, standings, teams, match flow, and tournament context. The live app is now retired and preserved as a static interactive archive.",
        creator: {
          "@type": "Organization",
          name: "Phugialy",
          url: "https://phugialy.com",
          email: "phu@phugialy.com",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Pulse90",
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        description:
          "A retired World Cup information product that helped fans scan fixtures, live context, group standings, team paths, and match storylines.",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/Discontinued",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Service",
        name: "Custom interactive website design",
        provider: {
          "@type": "Organization",
          name: "Phugialy",
          url: "https://phugialy.com",
          email: "phu@phugialy.com",
        },
        description:
          "Design and development for custom websites, product interfaces, interactive landing pages, and archive experiences inspired by Pulse90.",
        areaServed: "Worldwide",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What was Pulse90?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pulse90 was a World Cup watch desk built for fixtures, standings, teams, match flow, and tournament context.",
            },
          },
          {
            "@type": "Question",
            name: "Why is Pulse90 retired?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The live data experience has closed. The website is now a static final archive without Supabase, cron jobs, or live score updates.",
            },
          },
          {
            "@type": "Question",
            name: "Who should I contact for a website like Pulse90?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Visit phugialy.com or email phu@phugialy.com to discuss a custom interactive website.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <ClosingExperience />
    </>
  );
}
