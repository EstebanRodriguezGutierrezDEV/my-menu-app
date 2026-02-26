const fs = require("fs");
const path = require("path");

const replacements = {
  AddFoodModal: "ModalAgregarAlimento",
  CustomInput: "InputPersonalizado",
  MoveToArconModal: "ModalMoverAlmacen",
  PrimaryButton: "BotonPrincipal",
  RecipeCard: "TarjetaReceta",
  SettingRow: "FilaAjuste",
  SuggestionsModal: "ModalSugerencias",
  Login: "Acceso",
  Register: "Registro",
  Onboarding: "Bienvenida",
};

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach((file) => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, "app")).filter((f) =>
  f.endsWith(".js"),
);

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let originalContent = content;

  for (const [oldName, newName] of Object.entries(replacements)) {
    // Reemplaza coincidencias exactas de palabra entera (nombres de componente, strings de navegacion, rutas)
    const regex = new RegExp(`\\b${oldName}\\b`, "g");
    content = content.replace(regex, newName);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated:", file);
  }
});
