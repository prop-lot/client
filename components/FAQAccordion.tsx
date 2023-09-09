import { Fragment, useState } from "react";

const faqs = [
  {
    question: "How does Prop Lot work?",
    answer:
      "Prop Lot is the easiest way to find things Nouns want to fund and build them! Simply find an idea you like and propose a build. Nouns voters will vote to fund your build.",
  },
  {
    question: "Is Prop Lot free?",
    answer: "Yes, Prop Lot is free to use.",
  },
  {
    question: "How do I propose to an idea?",
    answer:
      'You can propose to an idea by clicking the "Propose" button on the idea detail page.',
  },
  {
    question: "I have an idea, how do I propose it to Nouns?",
    answer:
      "You can propose your idea to Nouns by creating a new proposal on the Proposals page.",
  },
];

const ChevronUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
  >
    <path
      d="M3.83398 10.0002L8.50065 5.3335L13.1673 10.0002"
      stroke="black"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
  >
    <path
      d="M13.1673 6L8.50065 10.6667L3.83398 6"
      stroke="#6B7280"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center w-1/2 mx-auto gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="text-indigo-600 text-lg font-medium">Learn more</div>
        <div className="text-black text-6xl font-bold">FAQs</div>
      </div>

      <div className="flex flex-col items-start w-full gap-8">
        {faqs.map((faq, i) => (
          <Fragment key={i}>
            <div
              className="w-full border-b-2 border-[#E9ECEF] py-[16px]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex justify-between w-full text-[18px] font-medium text-left text-black focus:outline-none"
              >
                <span>{faq.question}</span>
                <span>{openIndex === i ? <ChevronUp /> : <ChevronDown />}</span>
              </button>
            </div>
            <Fragment>
              {openIndex === i && (
                <div className="w-full gap-8 text-[#6B7280] border-b-2 border-[#E9ECEF] pb-8">
                  {faq.answer}
                </div>
              )}
            </Fragment>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default FAQAccordion;
