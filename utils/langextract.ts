import { extract, ExampleData } from "langextract";

// Define examples to guide the extraction
const examples: ExampleData[] = [
  {
    text: "John Smith is 30 years old and works at Google.",
    extractions: [
      {
        extractionClass: "person",
        extractionText: "John Smith",
        attributes: {
          age: "30",
          employer: "Google",
        },
      },
    ],
  },
];

// Extract information from text using Gemini
async function extractPersonInfo() {
  const result = await extract("Alice Johnson is 25 and works at Microsoft.", {
    promptDescription: "Extract person information including name, age, and employer",
    examples: examples,
    modelType: "gemini",
    apiKey: "your-gemini-api-key",
    modelId: "gemini-2.5-flash",
  });

  console.log(result.extractions);
  // Output: [
  //   {
  //     extractionClass: "person",
  //     extractionText: "Alice Johnson",
  //     attributes: {
  //       age: "25",
  //       employer: "Microsoft"
  //     },
  //     charInterval: { startPos: 0, endPos: 13 },
  //     alignmentStatus: "match_exact"
  //   }
  // ]
}
