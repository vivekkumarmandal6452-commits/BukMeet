const Adoption = require('../models/Adoption');
const Child = require('../models/Child');
const Parent = require('../models/Parent');

// @desc    Get all adoptions
// @route   GET /api/adoptions
// @access  Private
exports.getAdoptions = async (req, res) => {
  try {
    const { status, adoptionId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (adoptionId) query.adoptionId = { $regex: adoptionId, $options: 'i' };

    const adoptions = await Adoption.find(query)
      .populate('child', 'firstName lastName dateOfBirth gender currentStatus')
      .populate('parents', 'primaryApplicant applicationStatus')
      .populate('timeline.updatedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: adoptions.length,
      data: adoptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single adoption
// @route   GET /api/adoptions/:id
// @access  Private
exports.getAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate('child')
      .populate('parents')
      .populate('timeline.updatedBy', 'name email')
      .populate('finalizationDetails.finalizedBy', 'name email')
      .populate('alerts');

    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: adoption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new adoption
// @route   POST /api/adoptions
// @access  Private
exports.createAdoption = async (req, res) => {
  try {
    const { child, parents = [] } = req.body;

    if (!child || !parents.length) {
      return res.status(400).json({
        success: false,
        message: 'Child and at least one adoptive parent are required'
      });
    }

    const childDoc = await Child.findById(child);
    if (!childDoc) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    if (childDoc.currentStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Child is not available for adoption'
      });
    }

    const parentDocs = await Parent.find({ _id: { $in: parents } });
    if (!parentDocs.length || parentDocs.length !== parents.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more adoptive parents were not found'
      });
    }

    const notApproved = parentDocs.filter((parent) => parent.applicationStatus !== 'approved');
    if (notApproved.length) {
      return res.status(400).json({
        success: false,
        message: 'All selected adoptive parents must have approved applications'
      });
    }

    const adoption = await Adoption.create({
      ...req.body,
      timeline: [{
        stage: 'initiated',
        status: 'completed',
        date: Date.now(),
        notes: 'Adoption process initiated',
        updatedBy: req.user.id
      }]
    });

    childDoc.currentStatus = 'in_process';
    await childDoc.save();

    res.status(201).json({
      success: true,
      data: adoption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update adoption record
// @route   PUT /api/adoptions/:id
// @access  Private
exports.updateAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    const updateFields = { ...req.body };
    delete updateFields.child;
    delete updateFields.parents;

    if (updateFields.status && updateFields.status !== adoption.status) {
      adoption.timeline.push({
        stage: updateFields.status,
        status: 'completed',
        date: Date.now(),
        notes: updateFields.notes || `Status updated to ${updateFields.status}`,
        updatedBy: req.user.id
      });
    }

    Object.assign(adoption, updateFields);

    if (updateFields.status === 'finalized') {
      const child = await Child.findById(adoption.child);
      if (child) {
        child.currentStatus = 'adopted';
        child.adoptionDate = Date.now();
        await child.save();
      }
      adoption.finalizationDetails.finalizedBy = req.user.id;
      adoption.postAdoptionMonitoring.isActive = true;
      if (!adoption.postAdoptionMonitoring.frequency) {
        adoption.postAdoptionMonitoring.frequency = 'monthly';
      }
    }

    await adoption.save();

    res.status(200).json({
      success: true,
      data: adoption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete adoption record
// @route   DELETE /api/adoptions/:id
// @access  Private
exports.deleteAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    if (adoption.status !== 'finalized') {
      const child = await Child.findById(adoption.child);
      if (child) {
        child.currentStatus = 'available';
        child.adoptionDate = null;
        await child.save();
      }
    }

    await adoption.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload adoption document
// @route   POST /api/adoptions/:id/documents
// @access  Private
exports.uploadAdoptionDocument = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    const { documentName, documentType } = req.body;
    const documentUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/adoptions/${req.file.filename}` : req.body.documentUrl;

    if (!documentName || !documentType || !documentUrl) {
      return res.status(400).json({
        success: false,
        message: 'Document name, type, and file or URL are required'
      });
    }

    adoption.legalDocuments.push({
      documentName,
      documentType,
      documentUrl,
      uploadDate: Date.now(),
      uploadedBy: req.user.id,
      verificationStatus: 'pending'
    });

    await adoption.save();

    res.status(201).json({
      success: true,
      data: adoption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update adoption document verification status
// @route   PATCH /api/adoptions/:id/documents/:docId
// @access  Private
exports.updateAdoptionDocument = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    const document = adoption.legalDocuments.id(req.params.docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    document.verificationStatus = req.body.verificationStatus || document.verificationStatus;
    document.documentName = req.body.documentName || document.documentName;
    document.documentType = req.body.documentType || document.documentType;

    await adoption.save();

    res.status(200).json({
      success: true,
      data: adoption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add trial period visit
// @route   POST /api/adoptions/:id/visits
// @access  Private
exports.addVisit = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    adoption.trialPeriod.visits.push(req.body);
    await adoption.save();

    res.status(200).json({
      success: true,
      data: adoption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add post-adoption monitoring report
// @route   POST /api/adoptions/:id/monitoring
// @access  Private
exports.addMonitoringReport = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    adoption.postAdoptionMonitoring.reports.push(req.body);
    await adoption.save();

    res.status(200).json({
      success: true,
      data: adoption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get adoption statistics
// @route   GET /api/adoptions/stats
// @access  Private
exports.getAdoptionStats = async (req, res) => {
  try {
    const stats = await Adoption.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAdoptions = await Adoption.countDocuments();
    const finalizedAdoptions = await Adoption.countDocuments({ status: 'finalized' });

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalAdoptions,
        finalizedAdoptions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Update adoption status
// @route   PUT /api/adoptions/:id/status
// @access  Private
exports.updateAdoptionStatus = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }

    const { status, notes } = req.body;

    adoption.status = status || adoption.status;

    if (!adoption.timeline) {
      adoption.timeline = [];
    }

    adoption.timeline.push({
      stage: adoption.status,
      status: 'completed',
      date: new Date(),
      notes: notes || `Status updated to ${adoption.status}`,
      updatedBy: req.user.id
    });

    // Update child when adoption is finalized
    if (adoption.status === 'finalized') {
      const child = await Child.findById(adoption.child);

      if (child) {
        child.currentStatus = 'adopted';
        child.adoptionDate = new Date();
        await child.save();
      }
    }

    await adoption.save();

    res.status(200).json({
      success: true,
      data: adoption
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
