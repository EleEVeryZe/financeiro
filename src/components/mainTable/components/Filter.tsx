import AddIcon from "@mui/icons-material/Add";
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import "./filter.css";

const Filter = ({ setFiltros, filtros, fonteList, setModalOpen }) => {
  return (
    <Box className={"bordered"}>
      <Box className={"d-flex"}> 
        <TextField
          id="outlined-basic"
          value={filtros.filtro_meses}
          placeholder="Mês"
          className={"flex-1 mr-1"}
          onChange={(e) => {
            const newFiltro = {
              ...filtros,
              filtro_meses: e.target.value,
            };
            setFiltros(newFiltro);
            localStorage.setItem("filtro", JSON.stringify(newFiltro));
          }}
          variant="outlined"
        />
      
        <TextField
          id="outlined-basic"
          value={filtros.filtro_descricao}
          placeholder="Descrição"
          className={"flex-5"}
          onChange={(e) => {
            const newFiltro = {
              ...filtros,
              filtro_descricao: e.target.value,
            };
            setFiltros(newFiltro);

            localStorage.setItem("filtro", JSON.stringify(newFiltro));
          }}
          variant="outlined"
        />
      </Box>
      <Box className={"alignVertical"}>
        <Box>
          <FormControl size="small">
            <InputLabel id="demo-select-small-label">Fonte</InputLabel>
            <Select
              labelId="select-label"
              id="select"
              label="Fonte"
              sx={{ minWidth: 300 }}
              value={filtros.filtro_fonte}
              defaultValue=""
              onChange={(e) => {
                const newFiltro = {
                  ...filtros,
                  filtro_fonte: e.target.value,
                };
                setFiltros(newFiltro);
                localStorage.setItem("filtro", JSON.stringify(newFiltro));
              }}
            >
              <MenuItem value={""}>TODOS</MenuItem>
              {fonteList.map((ftItem) => (
                <MenuItem value={ftItem}>{ftItem}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <AddIcon className="mr-1" onClick={() => setModalOpen(true)} />
        
      </Box>
    </Box>
  );
};

export default Filter;
