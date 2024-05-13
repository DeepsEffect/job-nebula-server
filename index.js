const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://job-nebula.web.app"],
  })
);
app.use(express.json());

// everything working again yay! Electricity went out right the moment I pressed "git push" (timing right!) PC got shut down and it corrupted the freaked out of the git files; could not push, pull or do anything. Had to delete the .git and redeploy and merge the branches for the fix :) damn the electricity. Going through Stack Overflow, I found this was the only fix. Some of the other fellows had the same issues as well I found XD. Their electricity also went out during the moment they were committing lmao; Guess I am not the only one. Not sure why am I writing this paragraph of a comment which no one will ever read? I dunno, it's a cold night, just stopped raining outside, and I am feeling a bit bored lonely and sorrow and not feel like coding rn. To the ghost that will read this --> hope you have a great day :))

//mongodb
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ctz3uz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const jobCollection = client.db("JobNebulaDB").collection("jobCollection");
    const applicantsCollection = client
      .db("JobNebulaDB")
      .collection("applicantsCollection");

    //find all the jobs
    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    // find single job data
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    //find my job data
    app.get("/myJobs/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    //post a job
    app.post("/jobs", async (req, res) => {
      const job = req.body;
      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    //update job data
    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const updateJob = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const newUpdatedJob = {
        $set: {
          jobTitle: updateJob.jobTitle,
          bannerImg: updateJob.bannerImg,
          jobCategory: updateJob.jobCategory,
          "salaryRange.minSalary": updateJob.salaryRange.minSalary,
          "salaryRange.maxSalary": updateJob.salaryRange.maxSalary,
          jobDescription: updateJob.jobDescription,
          applicationDeadline: updateJob.applicationDeadline,
        },
      };
      const result = await jobCollection.updateOne(
        filter,
        newUpdatedJob,
        options
      );
      res.send(result);
    });

    // delete job data
    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // applicants related api
    app.post("/applicants", async (req, res) => {
      const applicantsJobInfo = req.body;
      const result = await applicantsCollection.insertOne(applicantsJobInfo);
      // check for duplicate application
      const dupQuery = {
        email: applicantsJobInfo.email,
        jobId: applicantsJobInfo.jobId,
      };
      const alreadyApplied = await applicantsCollection.findOne(dupQuery);
      // console.log(alreadyApplied);
      if (alreadyApplied) {
        return res.status(400).send("You have already applied for this job");
      }
      // update the applicants count in jobCollection
      const updateDoc = {
        $inc: { job_applicants: 1 },
      };
      const query = { _id: new ObjectId(applicantsJobInfo.jobId) };
      const updateApplicantCount = await jobCollection.updateOne(
        query,
        updateDoc
      );
      // console.log(updateApplicantCount);
      res.send(result);
    });

    //find all the applicants
    app.get("/applicants", async (req, res) => {
      const result = await applicantsCollection.find().toArray();
      res.send(result);
    });

    // find applicants by email
    app.get("/applicants/:email", async (req, res) => {
      const applicantsEmail = req.params.email;
      const query = { "applicantsInfo.applicantEmail": applicantsEmail };
      const result = await applicantsCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job nebula is looking for a job");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
