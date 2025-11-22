const express = require('express');
const flowChartRouter = express.Router();
const {
    handleCreateFlowChart,
    handleGetAllFlowCharts,
    handleGetFlowChartById,
    handleUpdateFlowChartById,
    handleDeleteFlowChartById,
} = require('../controllers/flowchart');
const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({storage: storage});
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    }
  });


// flowChartRouter.post('/flowchart',upload.any(), handleCreateFlowChart);
flowChartRouter.post('/flowchart', upload.fields([{ name: 'file', maxCount: 1 }]), handleCreateFlowChart);

flowChartRouter.get('/flowcharts', handleGetAllFlowCharts);
flowChartRouter.get('/flowchart/:id', handleGetFlowChartById);
flowChartRouter.put('/flowchart/:id', handleUpdateFlowChartById);
flowChartRouter.delete('/flowchart/:id', handleDeleteFlowChartById);

module.exports = flowChartRouter;
