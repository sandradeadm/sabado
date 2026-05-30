jest.mock("../repositories/cursos.repository.js", () => ({
  alumnosSinCurso: jest.fn(),
  buscarAlumnoSinCurso: jest.fn(),
  cursoIndividual: jest.fn(),
  asignarCursoMasivo: jest.fn()
}));

const service = require("../service/cursos.service.js");
const repo = require("../repositories/cursos.repository.js");

describe("cursos.service asignación de alumnos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("alumnosSinCurso delega al repository", async () => {
    const esperado = [{ id_alumno: 1 }];
    repo.alumnosSinCurso.mockResolvedValue(esperado);

    const result = await service.alumnosSinCurso();

    expect(result).toEqual(esperado);
    expect(repo.alumnosSinCurso).toHaveBeenCalledTimes(1);
  });

  test("buscarAlumnoSinCurso valida mínimo de caracteres", async () => {
    await expect(service.buscarAlumnoSinCurso("a"))
      .rejects.toThrow("El término de búsqueda debe tener al menos 2 caracteres");
  });

  test("buscarAlumnoSinCurso recorta y delega al repository", async () => {
    const esperado = [{ id_alumno: 2 }];
    repo.buscarAlumnoSinCurso.mockResolvedValue(esperado);

    const result = await service.buscarAlumnoSinCurso("  juan  ");

    expect(result).toEqual(esperado);
    expect(repo.buscarAlumnoSinCurso).toHaveBeenCalledWith("juan");
  });

  test("asignarCursoMasivo valida que haya alumnos", async () => {
    await expect(service.asignarCursoMasivo([], 10))
      .rejects.toThrow("Debe seleccionar al menos un alumno");
  });

  test("asignarCursoMasivo valida que el curso exista", async () => {
    repo.cursoIndividual.mockResolvedValue(undefined);

    await expect(service.asignarCursoMasivo([1, 2], 10))
      .rejects.toThrow("Curso no encontrado");
  });

  test("asignarCursoMasivo delega al repository con curso válido", async () => {
    const esperado = [{ id_alumno: 1, id_curso: 10 }];
    repo.cursoIndividual.mockResolvedValue({ id_curso: 10 });
    repo.asignarCursoMasivo.mockResolvedValue(esperado);

    const result = await service.asignarCursoMasivo([1], 10);

    expect(result).toEqual(esperado);
    expect(repo.asignarCursoMasivo).toHaveBeenCalledWith([1], 10);
  });
});
