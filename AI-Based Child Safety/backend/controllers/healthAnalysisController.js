const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Child = require('../models/Child');

const writeTempImage = (base64) => {
  const buffer = Buffer.from(base64.replace(/^data:image\/.+;base64,/, ''), 'base64');
  const tempDir = path.join(__dirname, '..', 'tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const fileName = `health_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

exports.analyzeHealth = async (req, res) => {
  try {
    const { imageBase64, imageUrl, childId } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either imageBase64 or imageUrl is required for health analysis'
      });
    }

    let inputPath;
    if (imageBase64) {
      inputPath = writeTempImage(imageBase64);
    } else {
      const imagePath = path.join(__dirname, '..', 'tmp', `health_url_${Date.now()}.jpg`);
      const fileData = Buffer.from(imageUrl.split(',')[1] || '', 'base64');
      fs.writeFileSync(imagePath, fileData);
      inputPath = imagePath;
    }

    const scriptPath = path.join(__dirname, '..', 'python', 'health_analysis.py');
    const pythonCmd = process.env.PYTHON_BIN || 'python3';
    const result = spawnSync(pythonCmd, [scriptPath, '--image', inputPath], {
      encoding: 'utf8',
      timeout: 20000
    });

    fs.unlinkSync(inputPath);

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      return res.status(500).json({
        success: false,
        message: 'Health analysis script error',
        details: result.stderr || 'Unknown error'
      });
    }

    const analysis = JSON.parse(result.stdout);

    if (childId) {
      const child = await Child.findById(childId);
      if (child) {
        child.healthAnalysis = child.healthAnalysis || {};
        child.healthAnalysis.lastReport = {
          ...analysis,
          analyzedAt: new Date()
        };
        child.healthAnalysis.history = child.healthAnalysis.history || [];
        child.healthAnalysis.history.push({
          ...analysis,
          analyzedAt: new Date()
        });
        await child.save();
      }
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
