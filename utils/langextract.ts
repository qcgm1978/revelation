import { extract, ExampleData } from "langextract";


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


async function extractPersonInfo() {
  const result = await extract("Alice Johnson is 25 and works at Microsoft.", {
    promptDescription: "Extract person information including name, age, and employer",
    examples: examples,
    modelType: "gemini",
    apiKey: "your-gemini-api-key",
    modelId: "gemini-2.5-flash",
  });

  console.log(result.extractions);
 
 
 
 
 
 
 
 
 
 
 
 
}
