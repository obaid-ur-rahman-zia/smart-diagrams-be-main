const asyncHandler = require("express-async-handler");
const FlowChart = require("../models/flowchart");
const axios = require("axios");
require("dotenv").config();

// Function to transcribe audio using OpenAI API
const transcribeAudio = async (audioBuffer, mimeType) => {
  try {
    let extension = "webm";
    if (mimeType.includes("mp3")) extension = "mp3";
    if (mimeType.includes("wav")) extension = "wav";
    if (mimeType.includes("ogg")) extension = "ogg";
    
    const blob = new Blob([audioBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, `audio.${extension}`);
    formData.append('model', 'whisper-1');
    
    console.log("Sending audio to OpenAI for transcription...");

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200) {
      console.log("OpenAI transcription successful");
      return response.data.text;
    } else {
      throw new Error(`OpenAI Error: ${response.status}, ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error transcribing audio with OpenAI:", error.response?.data || error.message);
    throw new Error(`OpenAI transcription failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

// Function to generate diagram using DeepSeek API
const generateDiagramWithDeepSeek = async (textData, diagramType, systemPrompt) => {
  try {
    console.log("Sending to DeepSeek API...");

    const deepSeekPayload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Create a comprehensive MermaidJS ${diagramType} based on: ${textData.substring(0, 3000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    };

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      deepSeekPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 45000,
      }
    );

    console.log("DeepSeek API Response status:", response.status);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating diagram with DeepSeek:", error.response?.data || error.message);
    throw new Error(`DeepSeek API failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

// Function to generate diagram using OpenAI API
const generateDiagramWithOpenAI = async (textData, diagramType, systemPrompt) => {
  try {
    console.log("Sending to OpenAI for diagram generation...");

    const openAIPayload = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Create a comprehensive MermaidJS ${diagramType} based on: ${textData.substring(0, 3000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      openAIPayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );

    console.log("OpenAI diagram generation response status:", response.status);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating diagram with OpenAI:", error.response?.data || error.message);
    throw new Error(`OpenAI diagram generation failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

// Helper function to get the appropriate default syntax for each diagram type
const getDefaultDiagramSyntax = (diagramType) => {
  switch (diagramType) {
    case "Flowchart": return "graph TD";
    case "Architecture": return "flowchart TD";
    case "Block Diagram": return "block-beta";
    case "ER Diagram": return "erDiagram";
    case "Requirement Diagram": return "requirementDiagram";
    case "Sequence Diagram": return "sequenceDiagram";
    case "User Journey": return "journey";
    default: return "graph TD";
  }
};

const getSystemPrompt = (diagramType) => {
  switch (diagramType) {
    case "Flowchart":
      return `STRICT MermaidJS Flowchart Syntax Rules:
ONLY generate flowchart code. NEVER use journey, architecture-beta, or other diagram types.

CORRECT SYNTAX:
flowchart LR
  A[Start] --Some text--> B(Continue)
  B --> C{Evaluate}
  C -- One --> D[Option 1]
  C -- Two --> E[Option 2]
  C -- Three --> F[Option 3]

Return ONLY flowchart code starting with "flowchart TD" or "flowchart LR".`;

    case "User Journey":
      return `STRICT MermaidJS Journey Diagram Syntax Rules:
ONLY generate journey code. NEVER use flowchart, architecture-beta, or other diagram types.

CORRECT SYNTAX:
journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me

Return ONLY journey code starting with "journey". Each task MUST follow: "Description: 1-5: Actor".`;

// case "Architecture":
//   return `STRICT architecture-beta SYNTAX ENFORCEMENT:

// MANDATORY SYNTAX RULES:
// 1. ALWAYS declare services: service service_id(icon)[Label] in group_id
// 2. ALWAYS use proper connection syntax: service1:port -- port:service2
// 3. NEVER use "end" or other flowchart syntax
// 4. ALWAYS put services inside groups with "in group_id"

// PATTERN SELECTION:
// - User-Facing Apps: Vertical flow User->Frontend->Backend->DB
// - Data Pipelines: Vertical flow Source->Process->Storage->Analytics  
// - IoT Systems: Vertical flow Sensors->Device->Gateway->Cloud->DB
// - Hardware: Mixed directions around central component
// - Processes: Horizontal flow Start->Step->Step->End

// CONNECTION LOGIC:
// - Main data flow: :B -- T: (vertical)
// - Side services: :B -- T: (horizontal)
// - Monitoring: :B -- T: (observation)


// CRITICAL: Check syntax before returning - every service MUST be declared properly!

// Return ONLY valid architecture-beta code with correct syntax.`;
case "Architecture":
  return `STRICT TREE HIERARCHY WITH BRANCHING:

CREATE BRANCHED TREE ARCHITECTURE - NOT LINEAR CHAINS:

TREE STRUCTURE RULES:
1. ROOT: Single starting point at top
2. BRANCHES: Multiple parallel paths downward
3. NO linear chains - must have branching
4. Use parent with multiple children for branching

BRANCHING PATTERNS:

CORRECT (Branched Tree):
architecture-beta
    group system(cloud)[System]
        service root(root)[Main System] in system
        service branch1(branch)[Branch 1] in system
        service branch2(branch)[Branch 2] in system
        service leaf1(leaf)[Leaf 1] in system
        service leaf2(leaf)[Leaf 2] in system
        service leaf3(leaf)[Leaf 3] in system
    
    root:B -- T:branch1
    root:B -- T:branch2
    branch1:B -- T:leaf1
    branch1:B -- T:leaf2
    branch2:B -- T:leaf3

WRONG (Linear Chain):
architecture-beta
    group system(cloud)[System]
        service a(a)[A] in system
        service b(b)[B] in system
        service c(c)[C] in system
        service d(d)[D] in system
    
    a:B -- T:b
    b:B -- T:c
    c:B -- T:d

CONTENT-SPECIFIC BRANCHING:

CI/CD PIPELINE (Branched):
architecture-beta
    group cicd(cloud)[CI/CD Pipeline]
        service developer(dev)[Developer] in cicd
        service git(git)[Git Repo] in cicd
        service ci(ci)[CI Server] in cicd
        service build(build)[Build] in cicd
        service test(test)[Tests] in cicd
        service deploy(staging)[Staging Deploy] in cicd
        service deploy_prod(production)[Production Deploy] in cicd
        service monitor(monitor)[Monitoring] in cicd
    
    developer:B -- T:git
    git:B -- T:ci
    ci:B -- T:build
    build:B -- T:test
    test:B -- T:deploy
    test:B -- T:deploy_prod
    deploy:B -- T:monitor
    deploy_prod:B -- T:monitor

ECOMMERCE (Branched):
architecture-beta
    group ecom(cloud)[E-commerce]
        service user(user)[User] in ecom
        service frontend(web)[Frontend] in ecom
        service backend(api)[Backend] in ecom
        service catalog(db)[Catalog] in ecom
        service orders(db)[Orders] in ecom
        service payment(payment)[Payment] in ecom
    
    user:B -- T:frontend
    frontend:B -- T:backend
    backend:B -- T:catalog
    backend:B -- T:orders
    backend:B -- T:payment

MANDATORY BRANCHING RULES:
- MUST have at least 2 branches from one parent
- NO service should have only one child (creates chains)
- Use parallel paths for different functionality
- Create natural branching points in the workflow

Return ONLY branched tree architecture-beta code - NO linear chains.`;

    case "Block Diagram":
      return `STRICT MermaidJS Block Diagram Syntax Rules:
ONLY generate block-beta code. NEVER use flowchart, journey, or other diagram types.

CORRECT SYNTAX:
block-beta
    columns 1
    db(("DB"))
    blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)
    block:ID
      A
      B["A wide one in the middle"]
      C
    end
    space
    D
    ID --> D
    C --> D
    style B fill:#d6dAdding,stroke:#333,stroke-width:4px

Return ONLY block-beta code starting with "block-beta".`;

case "ER Diagram":
  return `STRICT MermaidJS ER Diagram Syntax Rules:
ONLY generate erDiagram code. NEVER use flowchart, journey, or other diagram types.

CORRECT SYNTAX:
erDiagram
    PATIENT {
        string PatientID PK
        date DateOfBirth
        string GeneticInfo
        string DemographicInfo
    }

    PHYSICIAN {
        string PhysicianID PK
        string Name
        string Specialty
    }

    AI_MODEL {
        string ModelID PK
        string ModelName "e.g., CNN for Kawasaki Disease"
        string DiseaseSpecialty
        text TrainingDataDescription
        float Accuracy
    }

    DISEASE {
        string DiseaseID PK
        string DiseaseName "e.g., Kawasaki Disease, Colorectal Cancer"
        text Description
        boolean IsChronic
    }

    PATIENT ||--o{ DIAGNOSIS : receives
    PHYSICIAN ||--o{ DIAGNOSIS : makes
    DISEASE ||--o{ DIAGNOSIS : identified_by

    DIAGNOSIS {
        string DiagnosisID PK
        date DiagnosisDate
        string ConfidenceLevel "e.g., Confirmed, Preliminary"
        string Notes
    }

KEY REQUIREMENTS:
1. Define entities with { } blocks showing fields with data types
2. Use proper relationship syntax: ||--o{ , }|..|{ , etc.
3. Include field comments in quotes like "e.g., example"
4. Mark PK for primary key fields
5. Place entity definitions before or after relationships
6. Use descriptive relationship labels

Return ONLY erDiagram code starting with "erDiagram".`;

    case "Requirement Diagram":
      return `STRICT MermaidJS Requirement Diagram Syntax Rules:
ONLY generate requirementDiagram code. NEVER use flowchart, journey, or other diagram types.

CORRECT SYNTAX:
requirementDiagram
    requirement test_req {
      id: 1
      text: the test text.
      risk: high
      verifyMethod: test
    }
    element test_entity {
      type: simulation
    }
    test_entity - satisfies -> test_req

Return ONLY requirementDiagram code starting with "requirementDiagram".`;

    case "Sequence Diagram":
      return `STRICT MermaidJS Sequence Diagram Syntax Rules:
ONLY generate sequenceDiagram code. NEVER use flowchart, journey, or other diagram types.

CORRECT SYNTAX:
sequenceDiagram
    Alice->>+John: Hello John, how are you?
    Alice->>+John: John, can you hear me?
    John-->>-Alice: Hi Alice, I can hear you!
    John-->>-Alice: I feel great!

Return ONLY sequenceDiagram code starting with "sequenceDiagram".`;

    default:
      return `You are an expert at creating MermaidJS diagrams. Return ONLY the MermaidJS code without any explanations.`;
  }
};

// Enhanced syntax correction function
const correctMermaidSyntax = (chart, diagramType) => {
  if (!chart) return chart;

  // Remove common LLM artifacts
  chart = chart.replace(/```mermaid\s*/g, '');
  chart = chart.replace(/```\s*$/g, '');
  chart = chart.replace(/^```/gm, '');
  chart = chart.trim();

  // Force correct diagram type syntax
  switch (diagramType) {
    case "User Journey":
      if (!chart.startsWith('journey')) {
        // Remove any flowchart syntax
        chart = chart.replace(/flowchart\s+[A-Z]+\s*/g, '');
        chart = chart.replace(/graph\s+[A-Z]+\s*/g, '');
        chart = 'journey\n' + chart;
      }
      // Fix journey syntax issues
      chart = chart.replace(/step\.step\d+\s*/g, '');
      chart = chart.replace(/step\d+\s*/g, '');
      break;

    case "Flowchart":
      if (!chart.startsWith('flowchart') && !chart.startsWith('graph')) {
        // Remove any journey syntax
        chart = chart.replace(/journey\s*/g, '');
        chart = 'flowchart TD\n' + chart;
      }
      break;

    case "Architecture":
      if (!chart.startsWith('architecture-beta')) {
        chart = 'architecture-beta\n' + chart;
      }
      break;

    case "Block Diagram":
      if (!chart.startsWith('block-beta')) {
        chart = 'block-beta\n' + chart;
      }
      break;

    case "ER Diagram":
      if (!chart.startsWith('erDiagram')) {
        chart = 'erDiagram\n' + chart;
      }
      break;

    case "Requirement Diagram":
      if (!chart.startsWith('requirementDiagram')) {
        chart = 'requirementDiagram\n' + chart;
      }
      break;

    case "Sequence Diagram":
      if (!chart.startsWith('sequenceDiagram')) {
        chart = 'sequenceDiagram\n' + chart;
      }
      break;
  }

  return chart;
};
const cleanMermaidChart = (apiResponse, diagramType) => {
  console.log("Input to cleanMermaidChart:", typeof apiResponse, diagramType);

  if (!apiResponse) {
    return `${getDefaultDiagramSyntax(diagramType)}\n    A[No valid chart generated]`;
  }

  let chart = typeof apiResponse === "object" ? JSON.stringify(apiResponse) : apiResponse;

  // Extract from code blocks
  const mermaidPattern = /```mermaid\s*([\s\S]*?)\s*```/;
  const codePattern = /```(?:\w+)?\s*([\s\S]*?)\s*```/;

  let match = chart.match(mermaidPattern) || chart.match(codePattern);
  if (match && match[1]) {
    chart = match[1].trim();
  }

  // Apply strict syntax correction
  chart = correctMermaidSyntax(chart, diagramType);

  // Final validation - check if the chart starts with the correct diagram type
  const expectedStarts = {
    'User Journey': 'journey',
    'Flowchart': ['flowchart', 'graph'],
    'Architecture': 'architecture-beta',
    'Block Diagram': 'block-beta',
    'ER Diagram': 'erDiagram',
    'Requirement Diagram': 'requirementDiagram',
    'Sequence Diagram': 'sequenceDiagram'
  };

  const expectedStart = expectedStarts[diagramType];
  let isValid = false;

  if (Array.isArray(expectedStart)) {
    isValid = expectedStart.some(start => chart.toLowerCase().startsWith(start));
  } else {
    isValid = chart.toLowerCase().startsWith(expectedStart.toLowerCase());
  }

  if (!isValid) {
    console.log("Falling back to default syntax for:", diagramType);
    return `${getDefaultDiagramSyntax(diagramType)}\n    A[Fallback diagram - please edit manually]`;
  }

  return chart;
};
const handleCreateFlowChart = asyncHandler(async (req, res) => {
  try {
    const { title, selectInputMethod, aiModel, textOrMermaid, diagramType } = req.body;
    const file = req.files && req.files['file'] ? req.files['file'][0] : null;
    
    console.log("Request received:", {
      title,
      selectInputMethod,
      aiModel,
      diagramType,
      hasFile: !!file,
      fileType: file?.mimetype,
      fileSize: file?.size,
      hasText: !!textOrMermaid
    });

    const user_id = req.user._id;
    let textData = "";

    // Determine input source
    if (textOrMermaid) {
      textData = textOrMermaid;
      console.log("Using text input:", textData.substring(0, 100) + "...");
    } else if (file) {
      if (file.mimetype.startsWith("audio/")) {
        console.log("Processing audio file with OpenAI...");
        textData = await transcribeAudio(file.buffer, file.mimetype);
        console.log("Transcribed text:", textData.substring(0, 100) + "...");
      } else if (file.mimetype.startsWith("text/") || file.mimetype === "application/octet-stream") {
        textData = file.buffer.toString("utf-8");
        console.log("Using text file content:", textData.substring(0, 100) + "...");
      } else if (file.mimetype.startsWith("image/")) {
        textData = "Analyze this image for diagram data.";
        console.log("Using image file");
      } else {
        return res.status(400).json({ message: "Unsupported file type." });
      }
    } else {
      return res.status(400).json({ message: "No input provided." });
    }

    // If user provided Mermaid code, bypass AI and save corrected code
    const trimmed = (textData || "").trim().toLowerCase();
    const isMermaid = [
      'flowchart', 'graph', 'sequencediagram', 'erdiagram',
      'requirementdiagram', 'architecture-beta', 'block-beta', 'journey'
    ].some(prefix => trimmed.startsWith(prefix));

    let mermaidChart;

    if (isMermaid) {
      mermaidChart = cleanMermaidChart(textData, diagramType);
    } else {
      const systemPrompt = getSystemPrompt(diagramType);
      const prefersOpenAI = aiModel === 'Open AI';
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;

      let generatedText = null;
      try {
        if (prefersOpenAI && hasOpenAI) {
          generatedText = await generateDiagramWithOpenAI(textData, diagramType, systemPrompt);
        } else if (!prefersOpenAI && hasDeepSeek) {
          generatedText = await generateDiagramWithDeepSeek(textData, diagramType, systemPrompt);
        }
      } catch (e) {
        console.error('AI generation failed:', e.message);
      }

      mermaidChart = generatedText
        ? cleanMermaidChart(generatedText, diagramType)
        : `${getDefaultDiagramSyntax(diagramType)}\n    A[Start]`;
    }

    // Create and save flowchart/diagram
    const flowChart = new FlowChart({
      title,
      selectInputMethod,
      aiModel,
      diagramType,
      textOrMermaid: textData,
      mermaidString: mermaidChart,
      user_id,
    });

    await flowChart.save();

    res.status(201).json({
      status: 201,
      message: `${diagramType} created successfully using ${aiModel}`,
      flowChart: flowChart,
      mermaidChart: mermaidChart,
    });
  } catch (error) {
    console.error("Error creating diagram:", error.message);
    res.status(500).json({
      status: 500,
      message: "Failed to create diagram",
      error: error.message,
    });
  }
});

// Controller to fetch all FlowCharts for the logged-in user
const handleGetAllFlowCharts = asyncHandler(async (req, res) => {
  try {
    const flowCharts = await FlowChart.find({ user_id: req.user._id })
      .populate("user_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      message: "Diagrams fetched successfully",
      data: flowCharts,
    });
  } catch (error) {
    console.error("Error fetching FlowCharts:", error.message);
    res.status(500).json({
      status: 500,
      message: "Failed to fetch FlowCharts",
      error: error.message,
    });
  }
});

// Controller to fetch a specific FlowChart by ID
// const handleGetFlowChartById = asyncHandler(async (req, res) => {
//   try {
//     const flowChart = await FlowChart.findById(req.params.id).populate(
//       "user_id"
//     );

//     if (!flowChart) {
//       return res.status(404).json({
//         status: 404,
//         message: "FlowChart not found",
//       });
//     }

//     res.status(200).json({
//       status: 200,
//       message: "FlowChart fetched successfully",
//       data: flowChart,
//     });
//   } catch (error) {
//     console.error("Error fetching FlowChart by ID:", error.message);
//     res.status(500).json({
//       status: 500,
//       message: "Failed to fetch FlowChart",
//       error: error.message,
//     });
//   }
// });
// Controller to fetch a specific FlowChart by ID
const handleGetFlowChartById = asyncHandler(async (req, res) => {
  try {
    const flowChart = await FlowChart.findById(req.params.id).populate(
      "user_id"
    );

    if (!flowChart) {
      return res.status(404).json({
        status: 404,
        message: "FlowChart not found",
      });
    }

    // Use the actual diagram type from the database record
    const diagramType = flowChart.diagramType || "Diagram";
    
    res.status(200).json({
      status: 200,
      message: `${diagramType} fetched successfully`, 
      data: flowChart,
    });
  } catch (error) {
    console.error("Error fetching FlowChart by ID:", error.message);
    res.status(500).json({
      status: 500,
      message: "Failed to fetch FlowChart",
      error: error.message,
    });
  }
});

// Controller to update a FlowChart by ID
// const handleUpdateFlowChartById = asyncHandler(async (req, res) => {
//   try {
//     const { mermaidString } = req.body;

//     if (!mermaidString) {
//       return res.status(400).json({
//         status: 400,
//         message: "mermaidString field is required to update.",
//       });
//     }

//     const flowChart = await FlowChart.findByIdAndUpdate(
//       req.params.id,
//       { mermaidString },
//       { new: true }
//     );

//     if (!flowChart) {
//       return res.status(404).json({
//         status: 404,
//         message: "FlowChart not found",
//       });
//     }

//     res.status(200).json({
//       status: 200,
//       message: "FlowChart updated successfully",
//       data: flowChart,
//     });
//   } catch (error) {
//     console.error("Error updating FlowChart:", error.message);
//     res.status(500).json({
//       status: 500,
//       message: "Failed to update FlowChart",
//       error: error.message,
//     });
//   }
// });
// Controller to update a FlowChart by ID
const handleUpdateFlowChartById = asyncHandler(async (req, res) => {
  try {
    const { mermaidString } = req.body;

    if (!mermaidString) {
      return res.status(400).json({
        status: 400,
        message: "mermaidString field is required to update.",
      });
    }

    const flowChart = await FlowChart.findByIdAndUpdate(
      req.params.id,
      { 
        mermaidString,
        updatedAt: new Date() // Explicitly set updatedAt
      },
      { 
        new: true, // Return the updated document
        runValidators: true // Run model validations
      }
    ).populate("user_id"); // Populate the user data

    if (!flowChart) {
      return res.status(404).json({
        status: 404,
        message: "FlowChart not found",
      });
    }

    // Log the update to verify
    console.log("Updated FlowChart:", {
      id: flowChart._id,
      mermaidString: flowChart.mermaidString,
      updatedAt: flowChart.updatedAt
    });

    res.status(200).json({
      status: 200,
      message: "Diagram updated successfully",
      data: flowChart,
    });
  } catch (error) {
    console.error("Error updating FlowChart:", error.message);
    res.status(500).json({
      status: 500,
      message: "Failed to update FlowChart",
      error: error.message,
    });
  }
});

// Controller to delete a FlowChart by ID
const handleDeleteFlowChartById = asyncHandler(async (req, res) => {
  try {
    const flowChart = await FlowChart.findByIdAndDelete(req.params.id);

    if (!flowChart) {
      return res.status(404).json({
        status: 404,
        message: "FlowChart not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "FlowChart deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting FlowChart:", error.message);
    res.status(500).json({
      status: 500,
      message: "Failed to delete FlowChart",
      error: error.message,
    });
  }
});

module.exports = {
  handleCreateFlowChart,
  handleGetAllFlowCharts,
  handleGetFlowChartById,
  handleUpdateFlowChartById,
  handleDeleteFlowChartById,
};