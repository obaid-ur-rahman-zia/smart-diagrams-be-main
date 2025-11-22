const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FlowChartSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    selectInputMethod: {
        type: String,
        required: false,
        enum: ['Text/README', 'Voice Recording', 'Upload Audio'],
    },
    aiModel: {
        type: String,
        required: true,
        enum: ['Gemini', 'Smart Graph', 'Open AI'],
    },
    diagramType: {
        type: String,
        required: true,
        enum: ['Flowchart', 'ER Diagram', 'Sequence Diagram', 'Requirement Diagram', 'Block Diagram', 'Architecture', 'User Journey']
    },
    textOrMermaid: {
        type: String,
        required: false,
    },
    mermaidString:{
        type: String,
        required: true,
    },
},{timestamps: true});

const FlowChart = mongoose.model('FlowChart', FlowChartSchema);

module.exports = FlowChart;
