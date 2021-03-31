import { EROFS } from "constants";
import express from "express";
import { promises as fs } from "fs";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const grades = JSON.parse(await fs.readFile(global.gradesFile));

    res.send(grades);
  } catch (err) {
    next(err);
  }
});

router.get("/total", async (req, res, next) => {
  try {
    const grades = JSON.parse(await fs.readFile(global.gradesFile));

    if (!req.query.student || !req.query.subject) {
      throw new Error("Propriedades do aluno e disciplina são exigidos.");
    }

    const totalSum = grades.grades
      .filter((grade) => {
        if (
          grade.student === req.query.student &&
          grade.subject === req.query.subject
        ) {
          return grade;
        }
      })
      .reduce((acc, grade) => (acc += grade.value), 0);

    res.send(
      `Valor total para estudante"${req.query.student}" e subject "${req.query.subject}" é: ${totalSum}`
    );
  } catch (err) {
    next(err);
  }
});

router.get("/average", async (req, res, next) => {
  const grades = JSON.parse(await fs.readFile(global.gradesFile));

  if (!req.query.subject || !req.query.type) {
    throw new Error("Propriedades do aluno e disciplina são exigidos.");
  }

  const filteredGrades = grades.grades.filter((grade) => {
    if (grade.subject === req.query.subject && grade.type === req.query.type) {
      return grade;
    }
  });

  const totalSum = filteredGrades.reduce((acc, grade) => {
    acc += grade.value;
    return acc;
  }, 0);

  const average = totalSum / filteredGrades.length;

  res.send(
    `Valor médio por assunto "${req.query.subject}" e type "${req.query.type}" é: ${average}`
  );
});

router.get("/topthree", async (req, res, next) => {
  const grades = JSON.parse(await fs.readFile(global.gradesFile));

  if (!req.query.subject || !req.query.type) {
    throw new Error("Propriedades do aluno e disciplina são exigidos.");
  }

  const filteredGrades = grades.grades.filter((grade) => {
    if (grade.subject === req.query.subject && grade.type === req.query.type) {
      return grade;
    }
  });

  const topThree = filteredGrades.sort((a, b) => b.value - a.value);

  res.send(topThree);
});

router.post("/", async (req, res, next) => {
  try {
    const grades = JSON.parse(await fs.readFile(global.gradesFile));

    const { student, subject, type, value } = req.body;

    if (!student || !subject || !type || !value) {
      throw new Error(
        "As seguintes propriedades são necessárias para adicionar uma nova nota: aluno, disciplina, tipo e valor. Verifique os documentos da API para obter mais informações"
      );
    }

    const newGrade = {
      id: grades.nextId++,
      student,
      subject,
      type,
      value,
      timestamp: new Date(),
    };

    grades.grades.push(newGrade);

    await fs.writeFile(global.gradesFile, JSON.stringify(grades));

    res.send(newGrade);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const grades = JSON.parse(await fs.readFile(global.gradesFile));

    const { student, subject, type, value } = req.body;

    if (!student || !subject || !type || !value) {
      throw new Error(
        "As seguintes propriedades são necessárias para adicionar uma nova nota: aluno, disciplina, tipo e valor. Verifique os documentos da API para obter mais informações"
      );
    }

    const studentIndex = grades.grades.findIndex(
      (grade) => grade.id === Number(req.params.id)
    );

    if (studentIndex === -1) {
      throw new Error("Aluno não encontrado, verifique o id.");
    }

    const newGrade = {
      id: Number(req.params.id),
      student,
      subject,
      type,
      value,
    };

    grades.grades[studentIndex] = newGrade;

    await fs.writeFile(global.gradesFile, JSON.stringify(grades));

    res.send(newGrade);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const grades = JSON.parse(await fs.readFile(global.gradesFile));

    const studentIndex = grades.grades.findIndex(
      (grade) => grade.id === Number(req.params.id)
    );

    if (studentIndex === -1) {
      throw new Error("Aluno não encontrado, verifique o id.");
    }

    grades.grades = grades.grades.filter(
      (grade) => grade.id !== Number(req.params.id)
    );

    await fs.writeFile(global.gradesFile, JSON.stringify(grades));

    res.send(`student with id ${req.params.id} deleted.`);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const grades = JSON.parse(await fs.readFile(global.gradesFile));

    const grade = grades.grades.find(
      (grade) => grade.id === Number(req.params.id)
    );

    res.send(grade);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  res.status(500).send(err.message);
});
export default router;
