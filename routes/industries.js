// routes/industries.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/** Route to list all industries with associated company codes */
router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT i.code AS industry_code, i.industry, 
              ARRAY_AGG(ci.company_code) AS companies
       FROM industries i
       LEFT JOIN company_industry ci ON i.code = ci.industry_code
       GROUP BY i.code, i.industry`
    );

    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

/** Route to add a new industry */
router.post("/", async function (req, res, next) {
  try {
    const { code, industry } = req.body;

    const result = await db.query(
      `INSERT INTO industries (code, industry)
       VALUES ($1, $2)
       RETURNING code, industry`,
      [code, industry]
    );

    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Route to associate an industry to a company */
router.post(
  "/:industry_code/companies/:company_code",
  async function (req, res, next) {
    try {
      const { industry_code, company_code } = req.params;

      const result = await db.query(
        `INSERT INTO company_industry (industry_code, company_code)
       VALUES ($1, $2)
       RETURNING industry_code, company_code`,
        [industry_code, company_code]
      );

      return res.status(201).json({ association: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
