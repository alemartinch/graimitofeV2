const errorCodes = (code) => {
  let msg;
  switch (code) {
    case "CAUSE_WITHOUT_ACTIONS":
      msg =
        "La acción no se pudo resolver porque existen <strong>causas sin acciones</strong> en el evento";
      break;
    case "EVENT_WITHOUT_FINDINGS":
      msg =
        "El evento no pudo guardarse porque no <strong>tiene hallazgos cargados</strong>";
      break;
    case "EVENT_WITHOUT_CAUSES":
      msg =
        "El evento no pudo guardarse porque no <strong>tiene causas cargadas</strong>";
      break;
    case "EVENT_WITHOUT_ACTIONS":
      msg =
        "El evento no pudo guardarse porque no <strong>tiene acciones cargadas</strong>";
      break;
    case "CANNOT_DELETE_ONLY_CHILD":
      msg = "El elemento padre no puede quedar vacío";
      break;
    case "FINDING_WITHOUT_ACTIONS":
      msg = "El evento contiene hallazgos sin acciones";
      break;
    case "FINDING_WITHOUT_CAUSES":
      msg = "El evento contiene hallazgos sin causas";
      break;
    case "INVALID":
      msg = "No tiene permisos para realizar la acción";
      break;
    case "PERMISSION_DENIED":
      msg = "No tiene permisos para realizar la acción";
      break;
    case "DATA_VALIDATION_ERROR":
      msg = "Hubo un error en la validación de los datos ingresados";
      break;
    case "AUTHENTICATION_ERROR":
      msg = "Error de autenticación";
      break;
    case "PERMISSIONS_ERROR":
      msg = "No tiene permisos para realizar la acción";
      break;
    case "FILETYPE_UNKNOWN":
      msg = "El tipo de archivo no está soportado";
      break;
    case "FILETYPE_NOT_ALLOWED":
      msg = "El tipo de archivo no está soportado";
      break;
    case "FILE_TOO_BIG":
      msg = "El archivo es más grande del límite permitido";
      break;
    case "FILE_PROCESSING_ERROR":
      msg = "Hubo un error al procesar el archivo adjuntado";
      break;
    case "SNS_ERROR":
      msg = "Hubo un error en el envío de un e-mail";
      break;
    case "SES_ERROR":
      msg = "Hubo un error en el envío de un e-mail";
      break;
    case "CANNOT_RESEND_NOTIFICATION":
      msg = "Hubo un error al intentar reenviar un e-mail";
      break;
    case "INVALID_ENTITY":
      msg = "Error en la integridad de los datos";
      break;
    case "USER_NOT_FOUND":
      msg = "No se encontró el usuario";
      break;
    case "EVENT_NOT_FOUND":
      msg = "No se encontró el evento";
      break;
    case "REGULATION_NOT_FOUND":
      msg = "No se encontró el requerimiento";
      break;
    case "OCCURRENCE_NOT_FOUND":
      msg = "No se encontró la tarea";
      break;
    case "ASSESSMENT_NOT_FOUND":
      msg = "No se encontró la evaluación";
      break;
    case "ASSESSMENT_FILE_NOT_FOUND":
      msg = "No se encontró el archivo de la evaluación";
      break;
    case "REPET_ACTION_NOT_FOUND":
      msg = "No se encontró la tarea";
      break;
    case "REPET_ACTION_FILE_NOT_FOUND":
      msg = "No se encontró el archivo de la tarea";
      break;
    case "OCCURRENCE_ENTRY_NOT_FOUND":
      msg = "No se encontró el registro de la tarea";
      break;
    case "OCCURRENCE_ENTRY_FILE_NOT_FOUND":
      msg = "No se encontró el archivo del registro de la tarea";
      break;
    case "AUTHORITY_NOT_FOUND":
      msg = "No se encontró la autoridad";
      break;
    case "REPORT_TYPE_NOT_SUPPORTED":
      msg = "El formato no está soportado para el tipo de reporte solicitado";
      break;
    case "BAD_EVENT_STATUS_TRANSITION":
      msg = "Hubo un error al cambiar el estado del evento";
      break;
    case "BAD_ACTION_STATUS_TRANSITION":
      msg = "Hubo un error al cambiar el estado de la acción";
      break;
    case "BAD_ACTION_EVENT_STATUS_TRANSITION":
      msg =
        "Hubo un error al validar el estado del evento en relación con el estado de la acción";
      break;
    case "ACTION_WITHOUT_EVENT":
      msg = "La acción no tiene un evento relacionado";
      break;
    case "CAUSE_WITHOUT_EVENT":
      msg = "La causa no tiene un evento relacionado";
      break;
    case "ACTION_EFFC_DATA_NOT_COMPLETED":
      msg =
        "Está faltando completar la información para validar la efectividad de la acción";
      break;
    case "ACTION_MISSING_FIELDS":
      msg = "Falta completar campos para poder cerrar la acción";
      break;
    case "EFFEC_NOT_APPLICABLE":
      msg = "La acción no necesita validar efectividad";
      break;
    case "CAUSE_MULTIPLE_ASSOCIATION_INVALID":
      msg = "Error de asociación en la causa";
      break;
    case "ACTION_MULTIPLE_ASSOCIATION_INVALID":
      msg = "Error de asociación en la acción";
      break;
    case "CAUSE_MISSING_ASSOCIATION":
      msg = "Falta la asociación principal de la causa";
      break;
    case "ACTION_MISSING_ASSOCIATION":
      msg = "Falta la asociación principal de la acción";
      break;
    case "OWNER_CHANGE_DUE_DATE_ONCE":
      msg =
        "El propietario de la acción sólo puede cambiar la fecha de vencimiento 1 sola vez";
      break;
    case "USER_CANNOT_DELETE_ITSELF":
      msg = "No se puede borrar a sí mismo";
      break;
    case "CANNOT_INFER_EVENT_STATUS_FROM_ACTIONS":
      msg =
        "No se puede deducir el estado del evento en base al estado de las acciones";
      break;
    case "CANNOT_FIND_RELATED_EVENT":
      msg = "No se pudo encontrar el evento relacionado";
      break;
    case "MAX_RESULTS_PER_PAGE_EXCEEDED":
      msg = "Se excedió el máximo número de resultados por página";
      break;
    case "REACHED_MAX_NUMBER_OF_TAGS":
      msg = "Se excedió el máximo número de etiquetas";
      break;
    case "REACHED_MAX_NUMBER_OF_USERS":
      msg = "Se excedió el máximo número de usuarios";
      break;
    case "REACHED_MAX_NUMBER_OF_FACILITY":
      msg = "Se excedió el máximo número de establecimientos";
      break;
    case "REACHED_MAX_NUMBER_OF_SECTORS_PER_FACILITY":
      msg = "Se excedió el máximo número de sectores por establecimiento";
      break;
    case "REACHED_MAX_OPEN_EVENTS_PER_USER":
      msg =
        "Se excedió el máximo número de eventos (en estado abierto) por usuario";
      break;
    case "USER_HAS_NO_EMAIL":
      msg = "El usuario no tiene el dato e-mail";
      break;
    case "USER_INVALID_EMAIL":
      msg = "El usuario tiene un e-mail inválido o no está funcionando";
      break;
    case "NEED_24HS_PASSWORD_RESET":
      msg = "Sólo se puede restablecer la contraseña 1 vez al día";
      break;
    case "INVALID_USER_ROLE":
      msg = "La combinación elegida de roles es incorrecta";
      break;
    case "PERMISSIONS_INVALID":
      msg = "No tiene permisos para realizar la acción";
      break;
    case "ACTION_COMPLETED":
      msg = "No se puede continuar con la acción ya completa";
      break;
    case "ANY_ACTION_COMPLETE":
      msg = "No debería haber ninguna acción completa";
      break;
    case "FIELD_PROTECTED":
      msg = "No se pueden editar los campos";
      break;
    case "EVENT_CLOSED":
      msg = "El evento ya está cerrado";
      break;
    case "INCONSISTENT":
      msg = "Se encontró una inconsistencia en la solicitud";
      break;
    case "UNIQUE_FINDING":
      msg = "Sólo puede haber 1 hallazgo";
      break;
    case "ASSESSMENT_ALREADY_EXISTS_FOR_FACY":
      msg = "Ya existe una evaluación vigente para el establecimiento";
      break;
    case "NOT_CURRENT_ASSESSMENT":
      msg = "La evaluación no está vigente";
      break;
    case "NOT_CURRENT_REGULATION":
      msg = "El requerimiento no está vigente";
      break;
    case "MISSING_FREQUENCY":
      msg = "Falta la frecuencia de la tarea";
      break;
    case "CANNOT_DISABLE_NON_REPET_ACTION":
      msg = "No se puede deshabilitar una tarea que no tiene frecuencia";
      break;
    case "INTEGRITY_ERROR":
      msg = "Error en la integridad de los datos";
      break;
    case "UNKNOWN_ERROR":
      msg = "La operación no pudo realizarse";
      break;
    case "PASSWORD_INCORRECT":
      msg = "La contraseña es incorrecta";
      break;
    case "SAME_PASSWORD":
      msg = "La contraseña no puede ser la misma";
      break;
    case "PASSWORD_TOO_COMMON":
      msg = "La contraseña es muy simple";
      break;
    case "PASSWORD_TOO_SIMILAR":
      msg = "La contaseña no puede contener el nombre de usuario"
      break;
    case "PASSWORD_NO_NUMBER":
      msg = "La contraseña debe contener al menos un número";
      break;
    case "PASSWORD_NO_UPPERCASE":
      msg = "La contraseña debe contener al menos una letra mayúscula";
      break;
    case "PASSWORD_NO_SPECIAL_CHAR":
      msg = "La contraseña debe contener al menos un caracter especial";
      break;
    case "PASSWORD_TOO_SHORT":
      msg = "La contraseña es muy corta";
      break;
    default:
      msg = "La operación no pudo realizarse";
  }
  return msg;
};

export default errorCodes;
