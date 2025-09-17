const Job = require('../models/Job');

// Report a job as suspicious
exports.reportJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason = 'other', details = '' } = req.body || {};

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Prevent duplicate reports from the same user
    const alreadyReported = job.reports?.some(r => String(r.userId) === String(req.user.id));
    if (alreadyReported) {
      return res.status(409).json({ message: 'You have already reported this job' });
    }

    job.reports.push({
      userId: req.user.id,
      reason,
      details: String(details).trim().slice(0, 1000)
    });
    job.reportCount = (job.reportCount || 0) + 1;

    // Flag job when threshold reached (e.g., 3 reports)
    const FLAG_THRESHOLD = 3;
    if (job.reportCount >= FLAG_THRESHOLD) {
      job.isFlagged = true;
      if (job.status === 'active') {
        job.status = 'pending';
      }
    }

    await job.save();

    return res.status(201).json({
      message: 'Report submitted successfully',
      reportCount: job.reportCount,
      isFlagged: job.isFlagged
    });
  } catch (err) {
    console.error('Report job error:', err);
    return res.status(500).json({ message: 'Failed to submit report' });
  }
};


