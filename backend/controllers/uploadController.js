const csv = require('csv-parser');
const stream = require('stream');
const Member = require('../models/Member');
const Membership = require('../models/Membership');

// @desc    Upload CSV dataset of members and batch import into MongoDB
// @route   POST /api/upload/csv
// @access  Private
const uploadCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a valid .csv file.'
      });
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          if (results.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'CSV file is empty or could not be parsed.'
            });
          }

          let createdCount = 0;
          let updatedCount = 0;
          const sampleImported = [];

          for (const row of results) {
            // Support both standard CSV naming conventions
            const memberId = (row.Member_ID || row.memberId || row.MemberId || row.id || `M${1000 + Math.floor(Math.random() * 9000)}`).trim().toUpperCase();
            const age = parseInt(row.Age || row.age || 28, 10);
            const visitsLast30Days = parseInt(row.Visits_Last_30_Days || row.visitsLast30Days || row.visits || 8, 10);
            const classesAttended = parseInt(row.Classes_Attended || row.classesAttended || row.classes || 2, 10);
            const daysSinceLastVisit = parseInt(row.Days_Since_Last_Visit || row.daysSinceLastVisit || 5, 10);
            const monthlySpend = parseFloat(row.Monthly_Spend || row.monthlySpend || row.spend || 2200);
            
            // Renewed value can be "1", 1, "true", "True", etc.
            const renewedRaw = row.Renewed !== undefined ? row.Renewed : row.renewed;
            const renewed = renewedRaw === '1' || renewedRaw === 1 || renewedRaw === 'true' || renewedRaw === true || renewedRaw === 'TRUE';

            const name = row.Name || row.name || `Member ${memberId}`;
            const email = (row.Email || row.email || `${memberId.toLowerCase()}@fittrack.com`).toLowerCase();
            const phone = row.Phone || row.phone || '';
            const gender = row.Gender || row.gender || 'Prefer not to say';

            let member = await Member.findOne({ memberId });

            if (member) {
              member.age = age;
              member.visitsLast30Days = visitsLast30Days;
              member.classesAttended = classesAttended;
              member.daysSinceLastVisit = daysSinceLastVisit;
              member.monthlySpend = monthlySpend;
              member.renewed = renewed;
              await member.save();
              updatedCount++;
            } else {
              member = new Member({
                memberId,
                name,
                email,
                phone,
                age,
                gender,
                visitsLast30Days,
                classesAttended,
                daysSinceLastVisit,
                monthlySpend,
                renewed,
                status: 'Active'
              });
              await member.save();
              createdCount++;

              // Auto-seed initial membership
              const startDate = new Date();
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              await Membership.create({
                memberId: member._id,
                planName: monthlySpend >= 3000 ? 'Elite VIP' : monthlySpend >= 2500 ? 'Pro Performance' : 'Standard Fit',
                billingCycle: 'Monthly',
                price: monthlySpend,
                startDate,
                endDate,
                status: 'Active',
                autoRenew: renewed
              });
            }

            if (sampleImported.length < 5) {
              sampleImported.push({
                memberId: member.memberId,
                name: member.name,
                riskLevel: member.riskLevel,
                engagementLevel: member.engagementLevel
              });
            }
          }

          res.status(200).json({
            success: true,
            message: `CSV dataset imported successfully! Processed ${results.length} rows (${createdCount} created, ${updatedCount} updated).`,
            details: {
              totalProcessed: results.length,
              created: createdCount,
              updated: updatedCount,
              sample: sampleImported
            }
          });
        } catch (dbError) {
          res.status(500).json({
            success: false,
            message: 'Database error during CSV import',
            error: dbError.message
          });
        }
      })
      .on('error', (err) => {
        res.status(500).json({
          success: false,
          message: 'Error streaming or reading CSV file',
          error: err.message
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

module.exports = {
  uploadCsv
};
