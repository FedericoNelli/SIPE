import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X, Plus } from "lucide-react";

function MaterialExitEditModal({ onClose, notify, onExitUpdated }) {
  const [salidas, setSalidas] = useState([]);
  const [selectedExitId, setSelectedExitId] = useState(null);
  const [exitNumber, setExitNumber] = useState('');
  const [salidaData, setSalidaData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState('');
  const [showMaterialSelect, setShowMaterialSelect] = useState(false);
  const [maxDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    axios.get('http://localhost:8081/exits')
      .then(response => setSalidas(response.data))
      .catch(error => {
        console.error('Error fetching exits:', error);
        notify('error', 'Error al cargar las salidas. Verifique el servidor.');
      });

    axios.get('http://localhost:8081/users')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error('Error fetching users:', error));

    axios.get('http://localhost:8081/deposit-locations')
      .then(response => setUbicaciones(response.data))
      .catch(error => notify('error', 'Error al cargar ubicaciones'));
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      axios.get(`http://localhost:8081/deposit-names?locationId=${selectedLocation}`)
        .then(response => setDepositos(response.data))
        .catch(error => notify('error', 'Error al cargar depósitos'));
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedExitId) {
      axios.get('http://localhost:8081/exits-details')
        .then(response => {
          const selectedExitDetails = response.data.filter(detail => detail.salidaId === parseInt(selectedExitId));
          if (selectedExitDetails.length > 0) {
            const firstDetail = selectedExitDetails[0];
            setSalidaData(selectedExitDetails);
            setExitNumber(firstDetail.numero);
            const formattedDate = format(parse(firstDetail.fechaSalida, 'dd-MM-yyyy', new Date()), 'yyyy-MM-dd');
            setSelectedDate(formattedDate);
            setReason(firstDetail.motivo);
            setSelectedUser(firstDetail.usuarioId);
            setSelectedLocation(firstDetail.ubicacionId);
            setSelectedDeposit(firstDetail.depositoId);
            setSelectedMaterials(selectedExitDetails.map(detail => ({
              id: detail.idMaterial,
              nombre: detail.nombreMaterial,
              cantidadSalida: detail.cantidadMaterial || '',
              cantidadDisponible: detail.cantidadDisponible
            })));

            if (firstDetail.depositoId) {
              axios.get(`http://localhost:8081/materials/deposit/${firstDetail.depositoId}`)
                .then(response => setMaterials(response.data))
                .catch(error => console.error('Error al obtener materiales del depósito:', error));
            }
          }
        })
        .catch(error => {
          console.error('Error fetching exit details:', error);
          notify('error', 'Error al cargar los detalles de la salida');
        });
    }
  }, [selectedExitId]);

  const handleDepositoChange = (depositId) => {
    setSelectedDeposit(depositId);
    setSelectedMaterials(selectedMaterials);

    if (depositId) {
      axios.get(`http://localhost:8081/materials/deposit/${depositId}`)
        .then(response => setMaterials(response.data))
        .catch(error => console.error('Error al obtener materiales:', error));
    }
  };

  const handleMaterialQuantityChange = (materialId, quantity) => {
    setSelectedMaterials(prevMaterials =>
      prevMaterials.map(material => {
        if (material.id === materialId) {
          const parsedQuantity = parseInt(quantity, 10);

          if (isNaN(parsedQuantity) || quantity === '') return { ...material, cantidadSalida: '' };

          if (parsedQuantity < 0 || parsedQuantity > material.cantidadDisponible) {
            notify('error', 'Cantidad inválida: no puede ser negativa ni mayor a la disponible');
            return material;
          }

          return { ...material, cantidadSalida: parsedQuantity };
        }
        return material;
      })
    );
  };



  const handleAddMaterial = (materialId) => {
    const material = materials.find(mat => mat.id === parseInt(materialId));
    if (material && !selectedMaterials.find(m => m.id === material.id)) {
      setSelectedMaterials([...selectedMaterials, { ...material, cantidadSalida: '', cantidadDisponible: material.cantidad }]);
    }

    // Ocultar el selector automáticamente después de agregar el material
    setShowMaterialSelect(false);
  };

  const handleShowMaterialSelect = () => {
    // Mostrar el select si quedan materiales por agregar
    if (materials.filter(mat => !selectedMaterials.some(m => m.id === mat.id)).length > 0) {
      setShowMaterialSelect(true);
    }
  };


  const handleSave = () => {
    if (!selectedExitId) {
      notify('error', 'Debe seleccionar una salida para editar');
      return;
    }

    const updatedData = {
      numero: exitNumber,
      motivo: reason,
      fecha: selectedDate,
      idUsuario: selectedUser,
      idUbicacion: selectedLocation,
      idDeposito: selectedDeposit,
      materials: selectedMaterials.map(material => ({
        idMaterial: material.id,
        cantidad: material.cantidadSalida
      }))
    };

    axios.put(`http://localhost:8081/materials/exits/${selectedExitId}`, updatedData)
      .then(() => {
        notify('success', 'Salida actualizada con éxito');
        onExitUpdated();
        onClose();
      })
      .catch(error => {
        console.error('Error updating exit:', error);
        notify('error', 'Error al actualizar la salida');
      });
  };

  const handleExitSelection = (value) => {
    setSelectedExitId(value);
    const selectedExit = salidas.find(salida => salida.salidaId === parseInt(value));
    if (selectedExit) {
      setExitNumber(selectedExit.numero);
    }
  };

  // useEffect para cargar el número de salida en `exitNumber` cuando `selectedExitId` cambia
  useEffect(() => {
    if (selectedExitId) {
      const selectedExit = salidas.find(salida => salida.salidaId === parseInt(selectedExitId));
      if (selectedExit) {
        setExitNumber(selectedExit.numero);
      }
    }
  }, [selectedExitId, salidas]); // Escucha también cambios en `salidas` para asegurar sincronización

  // Función de validación para el número de salida
  const handleExitNumberChange = (e) => {
    const value = e.target.value;
    // Permitir que el input esté vacío, o solo números positivos
    if (value === '' || (/^[1-9]\d*$/.test(value))) {
      setExitNumber(value);
    } else if (value === '0' || value.startsWidth('-')) {
      setExitNumber('');
      notify('error', 'El número de salida no puede ser 0 ni negativo')
    }
  };


  return (
    <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl relative">
      <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
        <X size={14} strokeWidth={4} onClick={onClose} />
      </div>
      <CardHeader>
        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar Salida de Material</CardTitle>
        <hr />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 mt-4">
          <Label htmlFor="numeroSalida" className="text-sm font-medium">Número de Salida</Label>
          <Select onValueChange={handleExitSelection}>
            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
              <SelectValue placeholder="Selecciona un número de salida" />
            </SelectTrigger>
            <SelectContent>
              {salidas.map(salida => (
                <SelectItem className="bg-sipe-blue-light text-sipe-white" key={salida.salidaId} value={salida.salidaId}>
                  {salida.numero}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {salidaData && (
          <>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="editNumeroSalida" className="text-sm font-medium">Nuevo número de Salida</Label>
              <Input
                type="text"
                value={exitNumber}
                onChange={handleExitNumberChange}
                placeholder="Número de salida"
                className="border-b bg-sipe-blue-dark text-white"
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="fecha" className="text-sm font-medium">Fecha de Salida</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-b bg-sipe-blue-dark text-white"
                max={maxDate}
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="ubicacion" className="text-sm font-medium">Ubicación</Label>
              <Select onValueChange={setSelectedLocation} value={selectedLocation}>
                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map(location => (
                    <SelectItem key={location.id} value={location.id}>{location.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 mt-4">
              <Label htmlFor="deposito" className="text-sm font-medium">Depósito</Label>
              <Select onValueChange={handleDepositoChange} value={selectedDeposit}>
                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                  <SelectValue placeholder="Selecciona un depósito" />
                </SelectTrigger>
                <SelectContent>
                  {depositos.map(deposit => (
                    <SelectItem key={deposit.id} value={deposit.id}>{deposit.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 mt-4">
              <Label htmlFor="materiales" className="text-sm font-medium">Materiales</Label>
              {selectedMaterials.map(material => (
                <div key={material.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                  <div className="truncate">
                    <Label className="text-sm">{material.nombre} (Disponible: {material.cantidadDisponible})</Label>
                  </div>
                  <Input
                    type="text"
                    value={material.cantidadSalida}
                    onChange={(e) => handleMaterialQuantityChange(material.id, e.target.value)}
                    placeholder="Cant. a retirar"
                    className="border-b bg-sipe-blue-dark text-white text-sm"
                  />
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={() => setSelectedMaterials(selectedMaterials.filter(m => m.id !== material.id))}
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              ))}

              {/* Botón de "Agregar Material" si showMaterialSelect es false y hay materiales restantes */}
              {!showMaterialSelect && materials.filter(material => !selectedMaterials.some(m => m.id === material.id)).length > 0 && (
                <button
                  className="text-green-500 hover:text-green-700 text-sm flex items-center mt-2"
                  onClick={handleShowMaterialSelect}
                >
                  <Plus size={16} className="mr-1" /> Agregar Material
                </button>
              )}

              {/* Select para elegir material, se muestra solo cuando showMaterialSelect es true */}
              {showMaterialSelect && materials.filter(material => !selectedMaterials.some(m => m.id === material.id)).length > 0 ? (
                <Select onValueChange={(materialId) => handleAddMaterial(materialId)}>
                  <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg mt-2">
                    <SelectValue placeholder="Selecciona un material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.filter(material => !selectedMaterials.some(m => m.id === material.id)).map(material => (
                      <SelectItem key={material.id} value={material.id}>{material.nombre} (Disponible: {material.cantidad})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                materials.filter(material => !selectedMaterials.some(m => m.id === material.id)).length === 0 && (
                  <p className="text-gray-500 mt-2">No existen más materiales en el depósito</p>
                )
              )}
            </div>


            <div className="grid gap-2 mt-4">
              <Label htmlFor="reason" className="text-sm font-medium">Motivo</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo de la salida"
                className="border-b bg-sipe-blue-dark text-white"
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="usuario" className="text-sm font-medium">Usuario</Label>
              <Select onValueChange={setSelectedUser} value={selectedUser}>
                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
        <Button variant="sipebutton" size="sipebutton" onClick={handleSave}>CONFIRMAR</Button>
      </CardFooter>
    </Card>
  );
}

export default MaterialExitEditModal;
