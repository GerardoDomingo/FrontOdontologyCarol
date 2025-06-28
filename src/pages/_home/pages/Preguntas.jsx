import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  alpha, 
  MenuItem,
  InputAdornment
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailIcon from "@mui/icons-material/Email";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import InfoIcon from "@mui/icons-material/Info";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { keyframes } from "@emotion/react";
import Notificaciones from '../../../components/Layout/Notificaciones';
import CustomRecaptcha from "../../../components/Tools/Captcha";
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Animación de carga
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Componente principal
const FAQ = () => {
  // Estados
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { isDarkTheme } = useThemeContext();
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [categories, setCategories] = useState(["Todas"]);
  const dialogRef = useRef(null);
  const searchInputRef = useRef(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info"
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    question: "",
    isRegistered: false,
    paciente_id: null
  });

  // Theme y media queries
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Colores principales según el tema
  const colors = {
    primary: isDarkTheme ? "#60A5FA" : "#0A66C2",
    secondary: isDarkTheme ? "#93C5FD" : "#1E88E5",
    background: isDarkTheme
      ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
    cardBg: isDarkTheme ? "#1E2A3B" : "#ffffff",
    text: isDarkTheme ? "#ffffff" : "#0A1929",
    secondaryText: isDarkTheme ? "#cbd5e0" : "#555555",
    border: isDarkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    hover: isDarkTheme ? "rgba(96, 165, 250, 0.15)" : "rgba(10, 102, 194, 0.08)",
    shadow: isDarkTheme
      ? "0 8px 16px rgba(0,0,0,0.4)"
      : "0 8px 16px rgba(10,102,194,0.15)",
    placeholder: isDarkTheme ? "#4a5568" : "#cccccc"
  };

  // Función para mostrar notificaciones
  const showNotification = (message, type = "info", duration = 4000) => {
    setNotification({
      open: true,
      message,
      type
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, duration);
  };

  // Lista de 30 preguntas frecuentes simplificadas para una clínica dental básica
  const allFaqs = [
    {
      question: "¿Cómo debo cepillar correctamente mis dientes?",
      answer: (
        <>
          <p>Para un cepillado correcto, sigue estos pasos sencillos:</p>
          <ul>
            <li>Usa un cepillo de cerdas suaves</li>
            <li>Cepilla durante 2 minutos, dos veces al día</li>
            <li>Coloca el cepillo en un ángulo de 45 grados hacia la línea de las encías</li>
            <li>Realiza movimientos suaves y cortos (de adelante hacia atrás)</li>
            <li>Cepilla todas las superficies: externas, internas y masticatorias</li>
            <li>No olvides cepillar suavemente la lengua</li>
          </ul>
          <p>Recuerda cambiar tu cepillo dental cada 3 meses o cuando veas que las cerdas están desgastadas.</p>
        </>
      ),
      categoria: "Higiene dental"
    },
    {
      question: "¿Cuándo debo llevar a mi hijo por primera vez al dentista?",
      answer: (
        <>
          <p>Recomendamos llevar a tu hijo al dentista cuando aparezca su primer diente o, a más tardar, al cumplir un año de edad.</p>
          <p>Esta primera visita tiene varios objetivos importantes:</p>
          <ul>
            <li>Revisar el correcto desarrollo de los dientes y maxilares</li>
            <li>Identificar posibles problemas tempranos</li>
            <li>Enseñar a los padres técnicas adecuadas de higiene dental infantil</li>
            <li>Familiarizar al niño con el ambiente del consultorio dental</li>
          </ul>
          <p>Las visitas regulares desde temprana edad ayudan a prevenir problemas y a crear hábitos saludables.</p>
        </>
      ),
      categoria: "Odontopediatría"
    },
    {
      question: "¿Con qué frecuencia debo cambiar mi cepillo dental?",
      answer: (
        <>
          <p>Debes cambiar tu cepillo dental cada 3 meses aproximadamente, o antes si notas que:</p>
          <ul>
            <li>Las cerdas están desgastadas, dobladas o aplastadas</li>
            <li>Has estado enfermo (para evitar reinfección)</li>
          </ul>
          <p>Un cepillo desgastado no limpia eficazmente los dientes y puede dañar las encías. Mantener un cepillo en buen estado es fundamental para una buena higiene bucal.</p>
        </>
      ),
      categoria: "Higiene dental"
    },
    {
      question: "¿Qué es una limpieza dental profesional?",
      answer: (
        <>
          <p>Una limpieza dental profesional (profilaxis) es un procedimiento que realiza el dentista o higienista dental para:</p>
          <ul>
            <li>Eliminar la placa bacteriana y el sarro acumulados</li>
            <li>Limpiar áreas donde el cepillado común no llega</li>
            <li>Pulir las superficies dentales para eliminar manchas leves</li>
            <li>Prevenir enfermedades como la caries y la enfermedad periodontal</li>
          </ul>
          <p>Este procedimiento es indoloro y suele durar entre 30-45 minutos. Se recomienda realizarlo cada 6 meses como parte del cuidado preventivo.</p>
        </>
      ),
      categoria: "Prevención"
    },
    {
      question: "¿Por qué es importante usar hilo dental?",
      answer: (
        <>
          <p>El hilo dental es crucial porque:</p>
          <ul>
            <li>Elimina la placa bacteriana entre los dientes, donde el cepillo no llega</li>
            <li>Previene las caries interdentales y la enfermedad de las encías</li>
            <li>Reduce el mal aliento causado por restos de alimentos</li>
            <li>Complementa el cepillado para una limpieza bucal completa</li>
          </ul>
          <p>Para mejores resultados, usa el hilo dental una vez al día, preferiblemente antes de acostarte.</p>
        </>
      ),
      categoria: "Higiene dental"
    },
    {
      question: "¿Qué hacer en caso de un dolor de muelas?",
      answer: (
        <>
          <p>Si tienes dolor de muelas, puedes seguir estos pasos temporales mientras consigues atención profesional:</p>
          <ul>
            <li>Enjuaga tu boca con agua tibia y sal</li>
            <li>Toma un analgésico de venta libre según las indicaciones</li>
            <li>Aplica compresas frías en la mejilla (15 minutos sí, 15 minutos no)</li>
            <li>Evita alimentos muy calientes, fríos o azucarados</li>
          </ul>
          <p><strong>Importante:</strong> Estos son solo remedios temporales. El dolor dental casi siempre indica un problema que requiere atención profesional, por lo que debes agendar una cita lo antes posible.</p>
        </>
      ),
      categoria: "Urgencias"
    },
    {
      question: "¿Qué son las caries y cómo se previenen?",
      answer: (
        <>
          <p>Las caries son lesiones en los dientes causadas por la acción de bacterias que producen ácidos que desmineralizan el esmalte dental.</p>
          <p>Para prevenirlas:</p>
          <ul>
            <li>Cepilla tus dientes dos veces al día con pasta dental con flúor</li>
            <li>Usa hilo dental diariamente</li>
            <li>Limita el consumo de alimentos azucarados y bebidas ácidas</li>
            <li>Visita al dentista regularmente para revisiones</li>
            <li>Considera selladores dentales (especialmente para niños)</li>
          </ul>
          <p>La prevención temprana es la mejor manera de mantener tus dientes sanos toda la vida.</p>
        </>
      ),
      categoria: "Prevención"
    },
    {
      question: "¿Por qué se recomienda visitar al dentista cada 6 meses?",
      answer: (
        <>
          <p>Se recomienda visitar al dentista cada 6 meses porque:</p>
          <ul>
            <li>Permite detectar problemas en etapas tempranas cuando son más fáciles de tratar</li>
            <li>Incluye una limpieza profesional que elimina la placa y el sarro acumulados</li>
            <li>Ayuda a prevenir enfermedades como caries y problemas de encías</li>
            <li>Permite monitorear la salud bucal general y detectar cambios</li>
          </ul>
          <p>Las visitas regulares son una inversión en tu salud bucal a largo plazo y pueden ahorrarte tratamientos más costosos en el futuro.</p>
        </>
      ),
      categoria: "Prevención"
    },
    {
      question: "¿Qué causa el mal aliento y cómo puedo combatirlo?",
      answer: (
        <>
          <p>El mal aliento (halitosis) puede ser causado por:</p>
          <ul>
            <li>Mala higiene bucal y acumulación de bacterias</li>
            <li>Restos de alimentos entre los dientes</li>
            <li>Sequedad bucal (xerostomía)</li>
            <li>Enfermedades de las encías</li>
            <li>Ciertos alimentos como ajo, cebolla o especias</li>
            <li>Consumo de tabaco</li>
            <li>Algunos problemas médicos (sinusitis, reflujo, diabetes)</li>
          </ul>
          <p>Para combatirlo:</p>
          <ul>
            <li>Mejora tu higiene bucal (cepillado, hilo dental y limpieza de lengua)</li>
            <li>Mantente hidratado</li>
            <li>Visita regularmente al dentista</li>
            <li>Usa enjuague bucal antibacteriano</li>
            <li>Evita alimentos de fuerte olor</li>
          </ul>
          <p>Si el problema persiste a pesar de una buena higiene, consulta a tu dentista ya que podría indicar otro problema de salud.</p>
        </>
      ),
      categoria: "Higiene dental"
    },
    {
      question: "¿Qué es la gingivitis y cómo se trata?",
      answer: (
        <>
          <p>La gingivitis es una inflamación de las encías causada por la acumulación de placa bacteriana. Sus síntomas incluyen:</p>
          <ul>
            <li>Encías rojas, inflamadas o sensibles</li>
            <li>Sangrado al cepillarse o usar hilo dental</li>
            <li>Mal aliento persistente</li>
          </ul>
          <p>Tratamiento:</p>
          <ul>
            <li>Mejorar la higiene bucal (cepillado y uso de hilo dental)</li>
            <li>Limpieza profesional para eliminar placa y sarro</li>
            <li>Uso de enjuague bucal antiséptico</li>
            <li>Seguimiento dental para verificar la mejoría</li>
          </ul>
          <p>La buena noticia es que la gingivitis es reversible si se trata a tiempo. Sin tratamiento, puede progresar a enfermedad periodontal más seria.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Qué son las muelas del juicio y por qué a veces hay que extraerlas?",
      answer: (
        <>
          <p>Las muelas del juicio son los terceros molares que generalmente aparecen entre los 17 y 25 años. A menudo necesitan extraerse porque:</p>
          <ul>
            <li>No hay suficiente espacio en la boca para que erupcionen correctamente</li>
            <li>Pueden quedar impactadas (atrapadas) bajo las encías</li>
            <li>Pueden crecer en ángulo incorrecto, presionando otros dientes</li>
            <li>Son difíciles de limpiar, lo que aumenta el riesgo de caries y enfermedades</li>
          </ul>
          <p>No todas las muelas del juicio necesitan extracción. Tu dentista evaluará tu caso específico con radiografías para determinar si es necesario el procedimiento.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Cómo puedo aliviar la sensibilidad dental?",
      answer: (
        <>
          <p>La sensibilidad dental puede aliviarse con estas medidas:</p>
          <ul>
            <li>Usa pasta dental específica para dientes sensibles</li>
            <li>Cepíllate con un cepillo de cerdas suaves</li>
            <li>Evita alimentos y bebidas muy frías, calientes o ácidas</li>
            <li>Cepilla suavemente, sin ejercer mucha presión</li>
            <li>Evita el rechinar de dientes (considera un protector nocturno)</li>
            <li>Usa enjuague bucal con flúor</li>
          </ul>
          <p>Si la sensibilidad persiste o es severa, consulta a tu dentista. Podría ser síntoma de un problema más serio como caries, fracturas o encías retraídas que requieren tratamiento profesional.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Cómo funciona la anestesia dental?",
      answer: (
        <>
          <p>La anestesia dental funciona de la siguiente manera:</p>
          <ul>
            <li>Se aplica un gel anestésico tópico para adormecer la superficie</li>
            <li>Luego se inyecta el anestésico local cerca del nervio que transmite la sensación al área a tratar</li>
            <li>El anestésico bloquea temporalmente las señales de dolor que viajan por los nervios</li>
            <li>El efecto comienza en 1-2 minutos y dura entre 1-3 horas según el tipo usado</li>
          </ul>
          <p>La anestesia dental moderna es muy segura y eficaz, permitiendo realizar tratamientos sin dolor. La sensación de adormecimiento desaparece gradualmente después del procedimiento.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Es normal el sangrado de encías al cepillarse?",
      answer: (
        <>
          <p>No, el sangrado de encías al cepillarse <strong>no es normal</strong>, aunque es común. Generalmente indica:</p>
          <ul>
            <li>Inflamación de las encías (gingivitis)</li>
            <li>Acumulación de placa bacteriana</li>
            <li>Técnica de cepillado demasiado agresiva</li>
            <li>Uso de un cepillo con cerdas muy duras</li>
          </ul>
          <p>Solución:</p>
          <ul>
            <li>Mejora tu técnica de cepillado (movimientos suaves)</li>
            <li>Usa un cepillo de cerdas suaves</li>
            <li>No descuides el uso diario del hilo dental</li>
            <li>Visita al dentista para una limpieza profesional</li>
          </ul>
          <p>Si el sangrado persiste más de dos semanas a pesar de mejorar tu higiene, consulta a tu dentista, ya que podría indicar un problema más serio.</p>
        </>
      ),
      categoria: "Higiene dental"
    },
    {
      question: "¿Qué hace un higienista dental?",
      answer: (
        <>
          <p>Un higienista dental es un profesional especializado que:</p>
          <ul>
            <li>Realiza limpiezas dentales profesionales</li>
            <li>Elimina placa, sarro y manchas superficiales</li>
            <li>Toma radiografías dentales</li>
            <li>Aplica fluoruros y selladores</li>
            <li>Educa sobre técnicas correctas de cepillado y uso de hilo dental</li>
            <li>Ofrece consejos sobre nutrición para la salud bucal</li>
            <li>Examina las encías para detectar signos de enfermedad</li>
          </ul>
          <p>Los higienistas trabajan junto con los dentistas para proporcionarte una atención preventiva completa y ayudarte a mantener una buena salud bucal.</p>
        </>
      ),
      categoria: "Consultorio"
    },
    {
      question: "¿Por qué es importante reemplazar los dientes perdidos?",
      answer: (
        <>
          <p>Reemplazar los dientes perdidos es importante porque:</p>
          <ul>
            <li>Previene el movimiento de dientes adyacentes</li>
            <li>Mantiene la integridad de la estructura facial</li>
            <li>Mejora la capacidad para masticar y hablar con normalidad</li>
            <li>Evita la pérdida ósea que ocurre después de perder dientes</li>
            <li>Previene problemas en la articulación temporomandibular</li>
            <li>Mejora la confianza y la apariencia</li>
          </ul>
          <p>Existen varias opciones para reemplazar dientes según tu situación específica, incluyendo puentes, prótesis removibles y fijas.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Cómo puedo preparar a mi hijo para su primera visita al dentista?",
      answer: (
        <>
          <p>Para preparar a tu hijo para su primera visita al dentista:</p>
          <ul>
            <li>Habla positivamente sobre el dentista, evitando palabras que generen miedo</li>
            <li>Lee cuentos infantiles sobre visitas al dentista</li>
            <li>Juega a "ser el dentista" en casa (revisar dientes de muñecos)</li>
            <li>Explica de manera sencilla lo que sucederá ("el doctor contará tus dientes")</li>
            <li>Programa la cita en horario en que el niño esté descansado</li>
            <li>No prometas regalos por "portarse bien" (crea expectativas negativas)</li>
          </ul>
          <p>La primera visita suele ser corta y sencilla, orientada a que el niño se familiarice con el ambiente del consultorio dental.</p>
        </>
      ),
      categoria: "Odontopediatría"
    },
    {
      question: "¿Qué es una caries y cómo se trata?",
      answer: (
        <>
          <p>Una caries es un daño en el diente causado por bacterias que forman ácidos que destruyen el esmalte y la dentina. El tratamiento depende de su gravedad:</p>
          <ul>
            <li><strong>Caries incipiente:</strong> Aplicación de flúor y mejora de higiene</li>
            <li><strong>Caries pequeña-mediana:</strong> Eliminación del tejido dañado y restauración con empaste (resina o amalgama)</li>
            <li><strong>Caries profunda:</strong> Si afecta el nervio, puede requerir endodoncia (tratamiento de conducto) seguida de restauración</li>
            <li><strong>Caries extensa:</strong> Si el diente está muy dañado, podría necesitar extracción</li>
          </ul>
          <p>El diagnóstico temprano es clave para tratamientos menos invasivos, por eso son importantes las revisiones regulares.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Cómo puedo cuidar mis encías?",
      answer: (
        <>
          <p>Para mantener tus encías saludables:</p>
          <ul>
            <li>Cepilla tus dientes dos veces al día con técnica adecuada</li>
            <li>Usa hilo dental diariamente</li>
            <li>Considera un enjuague bucal antiséptico</li>
            <li>Visita al dentista cada 6 meses para limpiezas profesionales</li>
            <li>Mantén una dieta equilibrada rica en vitamina C</li>
            <li>Evita fumar (el tabaco aumenta el riesgo de enfermedad periodontal)</li>
            <li>Controla el estrés (puede afectar tu sistema inmunológico y la salud de las encías)</li>
          </ul>
          <p>Las encías sanas son de color rosa pálido, firmes y no sangran durante el cepillado o al usar hilo dental.</p>
        </>
      ),
      categoria: "Higiene dental"
    },
    {
      question: "¿Los niños necesitan pasta dental con flúor?",
      answer: (
        <>
          <p>Sí, los niños necesitan pasta dental con flúor, pero en cantidades apropiadas para su edad:</p>
          <ul>
            <li><strong>Menores de 3 años:</strong> Cantidad del tamaño de un grano de arroz</li>
            <li><strong>3-6 años:</strong> Cantidad del tamaño de un guisante</li>
          </ul>
          <p>El flúor ayuda a fortalecer el esmalte y prevenir caries. Es importante supervisar el cepillado para asegurar que:</p>
          <ul>
            <li>Usen la cantidad correcta de pasta</li>
            <li>Escupan después del cepillado</li>
            <li>Eviten tragar la pasta dental</li>
          </ul>
          <p>Usa pasta dental con flúor aprobada por asociaciones dentales reconocidas.</p>
        </>
      ),
      categoria: "Odontopediatría"
    },
    {
      question: "¿Qué puedo hacer si se me rompe un diente?",
      answer: (
        <>
          <p>Si se te rompe un diente, sigue estos pasos:</p>
          <ul>
            <li>Enjuaga tu boca suavemente con agua tibia</li>
            <li>Si hay sangrado, aplica una gasa con presión suave</li>
            <li>Para reducir la hinchazón, aplica una compresa fría en la mejilla</li>
            <li>Guarda cualquier fragmento del diente (envuélvelo en una gasa húmeda)</li>
            <li>Toma un analgésico de venta libre si sientes dolor</li>
            <li>Contacta a tu dentista de inmediato para una cita de urgencia</li>
          </ul>
          <p>Este es un caso que requiere atención profesional lo antes posible. Dependiendo de la gravedad de la fractura, el dentista puede repararlo con una restauración de resina, una corona, o en casos más serios, con tratamiento de conducto.</p>
        </>
      ),
      categoria: "Urgencias"
    },
    {
      question: "¿Qué es el bruxismo y cómo se trata?",
      answer: (
        <>
          <p>El bruxismo es el hábito de apretar o rechinar los dientes, generalmente durante el sueño. Puede causar:</p>
          <ul>
            <li>Desgaste dental</li>
            <li>Dolor de mandíbula</li>
            <li>Dolores de cabeza, especialmente por la mañana</li>
            <li>Sensibilidad dental</li>
            <li>Dientes agrietados o rotos</li>
          </ul>
          <p>Tratamiento:</p>
          <ul>
            <li>Uso de férula dental nocturna (protector bucal)</li>
            <li>Técnicas de reducción de estrés</li>
            <li>Ejercicios de relajación muscular</li>
            <li>Evitar la cafeína y el alcohol</li>
            <li>Mejorar la higiene del sueño</li>
          </ul>
          <p>Si sospechas que tienes bruxismo, consulta a tu dentista. El diagnóstico temprano puede prevenir daños dentales significativos.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Qué edad es buena para la primera revisión de ortodoncia?",
      answer: (
        <>
          <p>Se recomienda la primera evaluación ortodóncica alrededor de los 7 años de edad. En este momento:</p>
          <ul>
            <li>Ya han erupcionado algunos dientes permanentes</li>
            <li>Se puede detectar problemas de desarrollo mandibular</li>
            <li>Es posible identificar problemas de mordida tempranamente</li>
            <li>Hay mayor capacidad de respuesta a tratamientos interceptivos</li>
          </ul>
          <p>Esto no significa que el niño necesitará aparatos a esta edad. Muchas veces la evaluación temprana permite:</p>
          <ul>
            <li>Planificar el momento óptimo para el tratamiento</li>
            <li>Implementar medidas preventivas</li>
            <li>Reducir la necesidad de tratamientos extensos más adelante</li>
          </ul>
          <p>Cada caso es único, por lo que el ortodoncista determinará el plan adecuado según las necesidades específicas.</p>
        </>
      ),
      categoria: "Odontopediatría"
    },
    {
      question: "¿Cómo afecta la alimentación a la salud dental?",
      answer: (
        <>
          <p>La alimentación afecta significativamente la salud dental:</p>
          <ul>
            <li><strong>Alimentos perjudiciales:</strong>
              <ul>
                <li>Azúcares (dulces, refrescos, jugos procesados)</li>
                <li>Alimentos pegajosos (caramelos, frutas secas)</li>
                <li>Bebidas ácidas (refrescos, bebidas energéticas)</li>
                <li>Almidones refinados (pan blanco, papas fritas)</li>
              </ul>
            </li>
            <li><strong>Alimentos beneficiosos:</strong>
              <ul>
                <li>Frutas y verduras crujientes (manzanas, zanahorias)</li>
                <li>Lácteos (queso, yogur sin azúcar)</li>
                <li>Proteínas (pescado, huevos, carnes magras)</li>
                <li>Alimentos ricos en flúor y calcio</li>
                <li>Agua (ayuda a limpiar la boca y diluir ácidos)</li>
              </ul>
            </li>
          </ul>
          <p>No solo importa qué comes, sino también cuándo y con qué frecuencia. Los refrigerios frecuentes aumentan el riesgo de caries. Si comes algo dulce, es mejor hacerlo durante las comidas principales y no entre ellas.</p>
        </>
      ),
      categoria: "Prevención"
    },
    {
      question: "¿Cómo puedo manejar el miedo al dentista?",
      answer: (
        <>
          <p>Para manejar el miedo al dentista:</p>
          <ul>
            <li><strong>Comunícate abiertamente:</strong> Habla con tu dentista sobre tus temores</li>
            <li><strong>Empieza gradualmente:</strong> Comienza con procedimientos simples</li>
            <li><strong>Establece señales:</strong> Acuerda un gesto para indicar si necesitas un descanso</li>
            <li><strong>Técnicas de relajación:</strong> Practica respiración profunda o meditación</li>
            <li><strong>Distracción:</strong> Usa audífonos para escuchar música o podcasts</li>
            <li><strong>Elige el momento adecuado:</strong> Programa citas cuando estés menos estresado</li>
            <li><strong>Lleva apoyo:</strong> Pide a un amigo o familiar que te acompañe</li>
          </ul>
          <p>Recuerda que los dentistas modernos utilizan técnicas y equipos avanzados para minimizar las molestias. Compartir tus preocupaciones ayudará a tu dentista a adaptar el tratamiento a tus necesidades.</p>
        </>
      ),
      categoria: "Consultorio"
    },
    {
      question: "¿Qué es una endodoncia y cuándo se necesita?",
      answer: (
        <>
          <p>Una endodoncia (tratamiento de conducto) es un procedimiento para tratar el interior del diente cuando la pulpa (nervios y vasos sanguíneos) está infectada o inflamada.</p>
          <p>Se necesita cuando:</p>
          <ul>
            <li>Hay dolor intenso al masticar o aplicar presión</li>
            <li>Existe sensibilidad prolongada al calor o frío</li>
            <li>Hay oscurecimiento del diente</li>
            <li>Aparece hinchazón o sensibilidad en las encías cercanas</li>
            <li>Se presenta una lesión dental profunda o fractura</li>
          </ul>
          <p>El procedimiento consiste en eliminar la pulpa dañada, limpiar el conducto, desinfectarlo y sellarlo. Contrario a la creencia popular, con anestesia moderna este tratamiento no debe ser doloroso.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Cuánto tiempo dura un empaste dental?",
      answer: (
        <>
          <p>La duración de un empaste dental varía según estos factores:</p>
          <ul>
            <li><strong>Material utilizado:</strong>
              <ul>
                <li>Composite (resina): 5-10 años</li>
                <li>Amalgama (plateado): 10-15 años</li>
              </ul>
            </li>
            <li><strong>Factores que influyen en su duración:</strong>
              <ul>
                <li>Tamaño y ubicación del empaste</li>
                <li>Hábitos de higiene bucal</li>
                <li>Hábitos como rechinar los dientes</li>
                <li>Dieta y consumo de bebidas ácidas</li>
                <li>Visitas regulares al dentista</li>
              </ul>
            </li>
          </ul>
          <p>Con buenos cuidados, los empastes pueden durar muchos años. En tus revisiones dentales, el profesional verificará el estado de tus restauraciones para determinar si necesitan reemplazo.</p>
        </>
      ),
      categoria: "Tratamientos"
    },
    {
      question: "¿Por qué se hacen radiografías dentales?",
      answer: (
        <>
          <p>Las radiografías dentales son importantes porque permiten:</p>
          <ul>
            <li>Ver áreas no visibles durante el examen clínico</li>
            <li>Detectar caries entre los dientes</li>
            <li>Identificar problemas bajo las encías o dentro del hueso</li>
            <li>Evaluar el desarrollo dental en niños</li>
            <li>Verificar la salud de la raíz dental y hueso circundante</li>
            <li>Diagnosticar lesiones, quistes o tumores</li>
            <li>Planificar tratamientos como endodoncias o extracciones</li>
          </ul>
          <p>Las radiografías modernas usan niveles muy bajos de radiación y proporcionan información crucial para un diagnóstico completo. La frecuencia con que se toman depende de tu historial dental, edad y riesgo de enfermedad.</p>
        </>
      ),
      categoria: "Consultorio"
    },
    {
      question: "¿Qué puedo hacer si se me cae un diente permanente?",
      answer: (
        <>
          <p>Si se te cae un diente permanente por un golpe o accidente, actúa rápidamente:</p>
          <ol>
            <li>Recoge el diente tomándolo por la corona (parte visible), no por la raíz</li>
            <li>Enjuágalo suavemente con agua si está sucio (sin frotar)</li>
            <li>Si es posible, intenta recolocarlo en su lugar (orientado correctamente)</li>
            <li>Si no puedes reinsertarlo, conserva el diente en:
              <ul>
                <li>Leche fría</li>
                <li>Solución salina</li>
                <li>Saliva (mantenlo en tu mejilla)</li>
              </ul>
            </li>
            <li>Acude al dentista INMEDIATAMENTE (idealmente en los primeros 30 minutos)</li>
          </ol>
          <p>El tiempo es crucial - cuanto más rápido recibas atención, mayores posibilidades de salvar el diente. Este es un caso de emergencia dental.</p>
        </>
      ),
      categoria: "Urgencias"
    },
    {
      question: "¿Qué causa las manchas en los dientes?",
      answer: (
        <>
          <p>Las manchas dentales pueden ser causadas por diversos factores:</p>
          <ul>
            <li><strong>Manchas extrínsecas</strong> (superficiales):
              <ul>
                <li>Consumo de café, té, vino tinto o refresco de cola</li>
                <li>Tabaco (fumar o mascar)</li>
                <li>Alimentos con colorantes intensos</li>
                <li>Acumulación de placa y sarro</li>
              </ul>
            </li>
            <li><strong>Manchas intrínsecas</strong> (dentro del diente):
              <ul>
                <li>Uso excesivo de flúor durante el desarrollo dental</li>
                <li>Ciertos medicamentos (tetraciclina)</li>
                <li>Traumatismos dentales</li>
                <li>Envejecimiento natural</li>
                <li>Tratamientos dentales como endodoncias</li>
              </ul>
            </li>
          </ul>
          <p>Las manchas extrínsecas generalmente se pueden eliminar con limpieza profesional. Para las manchas intrínsecas, existen opciones como blanqueamiento dental o carillas.</p>
        </>
      ),
      categoria: "Estética dental"
    },
    {
      question: "¿Qué información debo proporcionar en mi primera consulta dental?",
      answer: (
        <>
          <p>En tu primera consulta dental, es importante proporcionar:</p>
          <ul>
            <li><strong>Historial médico completo:</strong>
              <ul>
                <li>Enfermedades crónicas o condiciones (diabetes, problemas cardíacos)</li>
                <li>Medicamentos que tomas regularmente</li>
                <li>Alergias (especialmente a medicamentos o látex)</li>
                <li>Cirugías recientes</li>
              </ul>
            </li>
            <li><strong>Historial dental:</strong>
              <ul>
                <li>Problemas dentales actuales o recurrentes</li>
                <li>Tratamientos dentales previos</li>
                <li>Experiencias negativas en consultas dentales</li>
                <li>Hábitos de higiene bucal</li>
              </ul>
            </li>
            <li><strong>Otros datos relevantes:</strong>
              <ul>
                <li>Si fumas o consumes tabaco</li>
                <li>Embarazo (en caso de mujeres)</li>
                <li>Ansiedad dental si la experimentas</li>
              </ul>
            </li>
          </ul>
          <p>Esta información ayuda al dentista a proporcionarte un tratamiento seguro y personalizado según tus necesidades específicas.</p>
        </>
      ),
      categoria: "Consultorio"
    },
    {
      question: "¿Qué son las carillas dentales?",
      answer: (
        <>
          <p>Las carillas dentales son láminas delgadas, generalmente de porcelana o composite, que se adhieren a la superficie frontal de los dientes para mejorar su apariencia.</p>
          <p>Se utilizan para corregir:</p>
          <ul>
            <li>Decoloración o manchas resistentes a blanqueamiento</li>
            <li>Dientes astillados o con pequeñas fracturas</li>
            <li>Dientes ligeramente desalineados</li>
            <li>Dientes con formas irregulares</li>
            <li>Espacios pequeños entre dientes</li>
            <li>Dientes desgastados</li>
          </ul>
          <p>El procedimiento generalmente requiere:
            <ul>
              <li>Diagnóstico y planificación</li>
              <li>Preparación mínima del diente</li>
              <li>Fabricación de la carilla</li>
              <li>Cementación permanente</li>
            </ul>
          </p>
          <p>Con buenos cuidados, las carillas pueden durar entre 10-15 años. Son una solución estética muy popular por su aspecto natural y resistencia.</p>
        </>
      ),
      categoria: "Estética dental"
    },
    {
      question: "¿Cómo identificar una emergencia dental?",
      answer: (
        <>
          <p>Las siguientes situaciones generalmente se consideran emergencias dentales y requieren atención inmediata:</p>
          <ul>
            <li>Dolor dental severo y persistente</li>
            <li>Hinchazón significativa en cara, encías o cuello</li>
            <li>Sangrado que no se detiene</li>
            <li>Traumatismo o golpe que resulta en dientes rotos o caídos</li>
            <li>Infección con síntomas como mal sabor, fiebre o dificultad para tragar/respirar</li>
            <li>Restauración perdida (corona o empaste) que causa dolor agudo</li>
          </ul>
          <p>Si experimentas cualquiera de estas situaciones:</p>
          <ul>
            <li>Contacta inmediatamente a tu dentista</li>
            <li>Si es fuera de horario, busca servicios de emergencia dental</li>
            <li>Si hay hinchazón severa o dificultad para respirar, acude a urgencias hospitalarias</li>
          </ul>
          <p>Recuerda: el tratamiento rápido puede evitar complicaciones y, en algunos casos como dientes avulsionados (caídos), es crucial para salvar la pieza dental.</p>
        </>
      ),
      categoria: "Urgencias"
    }
  ];

  // Función para obtener FAQs
  const fetchFAQs = useCallback(async () => {
    setLoadingFaqs(true);

    try {
      // Simulamos la carga de preguntas
      await new Promise(resolve => setTimeout(resolve, 800));

      // Usamos las preguntas estáticas
      setFaqs(allFaqs);

      // Seleccionar 6 preguntas aleatorias para mostrar inicialmente
      const shuffledFaqs = [...allFaqs].sort(() => 0.5 - Math.random());
      setFilteredFaqs(shuffledFaqs.slice(0, 6));

      // Extraemos categorías únicas (solo las que existen en las preguntas)
      const uniqueCategories = ['Todas', ...new Set(allFaqs.map(faq => faq.categoria))].sort();
      setCategories(uniqueCategories);

    } catch (error) {
      console.error("Error al cargar preguntas:", error);
      showNotification("No se pudieron cargar las preguntas frecuentes", "error");
      setFaqs([]);
      setFilteredFaqs([]);
    } finally {
      setLoadingFaqs(false);
    }
  }, []);



  // Función para obtener nuevas preguntas aleatorias
  const getRandomFaqs = () => {
    let pool = activeCategory !== "Todas" 
      ? faqs.filter(faq => faq.categoria === activeCategory)
      : [...faqs];
      
    const randomFaqs = pool.sort(() => 0.5 - Math.random()).slice(0, 6);
    setFilteredFaqs(randomFaqs);
    
    // Mostrar notificación de actualización
    showNotification("Se han cargado nuevas preguntas aleatorias", "info", 1500);
  };

  // Filtrar preguntas por búsqueda y categoría
  useEffect(() => {
    if (faqs.length === 0 || searchQuery === undefined) return;
    
    // Si hay búsqueda, filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      let result = faqs.filter(
        faq => faq.question.toLowerCase().includes(query)
      );
      
      // Filtrar por categoría también si no es "Todas"
      if (activeCategory !== "Todas") {
        result = result.filter(faq => faq.categoria === activeCategory);
      }
      
      setFilteredFaqs(result);
    } 
    // Si no hay búsqueda pero hay categoría
    else if (activeCategory !== "Todas") {
      const categoryFaqs = faqs.filter(faq => faq.categoria === activeCategory);
      setFilteredFaqs(categoryFaqs);
    }
    // Si no hay búsqueda y categoría es "Todas", mantenemos las preguntas aleatorias iniciales
  }, [faqs, searchQuery, activeCategory]);

  // Cargar preguntas al montar el componente
  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // Handlers para acordeón
  const handleChange = (panel) => (event, isExpanded) => {
    try {
      setExpandedPanel(isExpanded ? panel : false);
    } catch (error) {
      console.error("Error al manejar el acordeón:", error);
    }
  };

  // Handlers de formulario
  const handleFormChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } catch (error) {
      console.error("Error en el formulario:", error);
      showNotification("Error al actualizar el formulario", "error");
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaVerified(!!value);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkEmailInDatabase = async () => {
    try {
      if (!validateEmail(formData.email)) {
        showNotification("Por favor ingrese un correo electrónico válido", "warning");
        return;
      }

      const response = await fetch(
        "https://back-end-4803.onrender.com/api/preguntas/verificar-correo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        name: data.exists ? `${data.name} ${data.apellido_paterno}` : "",
        isRegistered: data.exists,
        paciente_id: data.exists ? data.paciente_id : null,
      }));

      if (data.exists) {
        showNotification("¿Qué duda tiene mi paciente?", "success");
      }

    } catch (error) {
      showNotification("Error al verificar el correo electrónico", "error");
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      showNotification("Por favor ingrese su correo electrónico", "warning");
      return false;
    }
    if (!formData.name.trim()) {
      showNotification("Por favor ingrese su nombre", "warning");
      return false;
    }
    if (!formData.question.trim()) {
      showNotification("Por favor ingrese su pregunta", "warning");
      return false;
    }
    if (!captchaVerified) {
      showNotification("Por favor complete la verificación de seguridad", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification("Su pregunta ha sido enviada. Responderemos a la brevedad posible.", "success", 5000);
      setOpenModal(false);

      // Resetear formulario
      setFormData({
        email: "",
        name: "",
        question: "",
        isRegistered: false,
        paciente_id: null
      });
      setCaptchaVerified(false);
    } catch (error) {
      console.error("Error al enviar:", error);
      showNotification("Error al enviar la pregunta", "error");
    }
  };

  // Función para manejar la búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // Si hay búsqueda, aplicar el filtro de categoría sobre los resultados de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      let searchResults = faqs.filter(
        faq => faq.question.toLowerCase().includes(query)
      );
      
      if (category !== "Todas") {
        setFilteredFaqs(searchResults.filter(faq => faq.categoria === category));
      } else {
        setFilteredFaqs(searchResults);
      }
    } 
    // Si no hay búsqueda, mostrar todas las preguntas de esa categoría
    else {
      if (category !== "Todas") {
        setFilteredFaqs(faqs.filter(faq => faq.categoria === category));
      }
      // Si volvemos a "Todas", mantener las mismas preguntas aleatorias iniciales
    }
  };

  // Componente de esqueleto para la carga
  const SkeletonFAQ = () => (
    <Box sx={{ my: 2, width: '100%' }}>
      {[1, 2, 3, 4].map((_, index) => (
        <Paper
          key={index}
          sx={{
            my: 2,
            p: 2,
            borderRadius: '12px',
            background: `linear-gradient(90deg, ${isDarkTheme ? '#1E2A3B' : '#f5f5f5'
              } 25%, ${isDarkTheme ? '#2C3E50' : '#e0e0e0'
              } 37%, ${isDarkTheme ? '#1E2A3B' : '#f5f5f5'
              } 63%)`,
            backgroundSize: '1000px 100%',
            animation: `${shimmer} 2s infinite linear`,
            height: index === 0 ? '100px' : '80px',
            opacity: 1 - (index * 0.2)
          }}
        />
      ))}
    </Box>
  );

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  // Estilos
  const styles = {
    container: {
      background: colors.background,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: "85vh",
      padding: isMobile ? "1.5rem" : "3rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "all 0.3s ease-in-out",
      position: "relative",
      overflow: 'hidden'
    },
    header: {
      width: '100%',
      maxWidth: '800px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      mb: isTablet ? 3 : 5,
      position: 'relative',
      zIndex: 1
    },
    title: {
      color: isDarkTheme ? "#ffffff" : "#0A1929",
      fontWeight: 800,
      fontSize: isMobile ? "1.75rem" : "2.5rem",
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
      marginBottom: '2rem',
      textTransform: "uppercase",
      letterSpacing: "1px",
      textShadow: isDarkTheme ? "0 2px 10px rgba(255, 255, 255, 0.3)" : "0 2px 5px rgba(10, 102, 194, 0.2)",
      position: 'relative',
      display: 'inline-block',
      '&::after': {
        content: '""',
        position: 'absolute',
        left: '50%',
        bottom: '-10px',
        width: '80px',
        height: '4px',
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
        transform: 'translateX(-50%)',
        borderRadius: '4px'
      }
    },
    subtitle: {
      color: colors.secondaryText,
      fontSize: isMobile ? "0.9rem" : "1rem",
      textAlign: "center",
      maxWidth: "600px",
      mt: 3,
      mb: 4,
      lineHeight: 1.6
    },
    searchContainer: {
      width: '100%',
      maxWidth: '700px',
      mb: 3,
      mt: 2
    },
    searchField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "30px",
        backgroundColor: alpha(colors.cardBg, 0.7),
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)"
        },
        "&.Mui-focused": {
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)"
        }
      },
      "& .MuiOutlinedInput-input": {
        padding: "14px 16px",
        fontFamily: "Montserrat, sans-serif",
        color: colors.text
      },
      "& .MuiInputAdornment-root": {
        marginRight: "8px"
      },
      "& fieldset": {
        borderColor: colors.border
      }
    },
    categoriesContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: isMobile ? 1 : 1.5,
      width: '100%',
      maxWidth: '800px',
      mb: 4,
      px: 1
    },
    categoryChip: {
      borderRadius: '20px',
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 500,
      fontSize: isMobile ? '0.7rem' : '0.85rem',
      py: 1.5,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
      }
    },
    faqContainer: {
      width: '100%',
      maxWidth: '800px',
      position: 'relative',
      zIndex: 1
    },
    accordion: {
      background: alpha(colors.cardBg, 0.8),
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      boxShadow: colors.shadow,
      mb: 2.5,
      overflow: 'hidden',
      transition: "all 0.3s ease-in-out",
      border: `1px solid ${alpha(colors.border, 0.1)}`,
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: isDarkTheme
          ? "0 12px 20px rgba(0,0,0,0.5)"
          : "0 12px 20px rgba(10,102,194,0.2)",
      },
      "&:before": {
        display: "none"
      }
    },
    accordionSummary: {
      minHeight: '64px',
      padding: '0 16px',
      "&.Mui-expanded": {
        minHeight: '64px',
        borderBottom: `1px solid ${alpha(colors.border, 0.1)}`
      }
    },
    accordionDetails: {
      padding: '16px',
      backgroundColor: alpha(isDarkTheme ? "#1A2636" : "#f8f9fa", 0.5)
    },
    question: {
      fontFamily: '"Montserrat", sans-serif',
      fontSize: isMobile ? "0.95rem" : "1.05rem",
      fontWeight: 600,
      color: colors.text,
      transition: "color 0.3s ease",
      mr: 1
    },
    answer: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: isMobile ? "0.9rem" : "0.95rem",
      color: colors.secondaryText,
      lineHeight: 1.8,
      transition: "all 0.3s ease",
    },
    askButton: {
      background: 'transparent',
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
      fontFamily: "Montserrat, sans-serif",
      padding: "0.6rem 1.5rem",
      borderRadius: "8px",
      textTransform: "none",
      fontSize: isMobile ? "0.9rem" : "1rem",
      fontWeight: 500,
      mt: 4,
      transition: "all 0.3s ease",
      boxShadow: "none",
      "&:hover": {
        background: alpha(colors.primary, 0.1),
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transform: "translateY(-2px)"
      }
    },
    controlsContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      mb: 2,
      mt: 3
    },
    modal: {
      "& .MuiDialog-paper": {
        borderRadius: "16px",
        padding: "0",
        boxShadow: isDarkTheme
          ? "0 24px 48px rgba(0,0,0,0.5)"
          : "0 24px 48px rgba(0,0,0,0.2)",
        backgroundColor: colors.cardBg,
        overflow: "hidden",
        maxWidth: "550px"
      }
    },
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: "#ffffff",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    modalTitle: {
      fontFamily: "Montserrat, sans-serif",
      color: "#ffffff",
      fontSize: "1.4rem",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    modalContent: {
      padding: "24px",
    },
    textField: {
      marginBottom: "1.5rem",
      "& label": {
        fontFamily: "Montserrat, sans-serif",
        color: isDarkTheme ? alpha(colors.secondaryText, 0.7) : undefined,
        fontSize: "0.95rem",
      },
      "& input, & textarea": {
        fontFamily: "Montserrat, sans-serif",
        color: colors.text,
        fontSize: "1rem",
        padding: "16px 14px",
      },
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-1px)",
        },
        "& fieldset": {
          borderColor: colors.border,
          transition: "border-color 0.3s ease",
        },
        "&:hover fieldset": {
          borderColor: colors.primary,
        },
        "&.Mui-focused fieldset": {
          borderColor: colors.primary,
          borderWidth: "2px",
        },
      },
    },
    dialogActions: {
      padding: "16px 24px",
      background: isDarkTheme ? alpha("#000000", 0.2) : alpha("#f5f5f5", 0.5),
      borderTop: `1px solid ${colors.border}`
    },
    captchaContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '1.5rem',
      minHeight: '78px',
      transition: 'all 0.3s ease'
    },
    noFaqsMessage: {
      marginTop: "2rem",
      color: colors.secondaryText,
      fontSize: "1.1rem",
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
      padding: "2rem",
      border: `2px dashed ${isDarkTheme ? "#4a5568" : "#ccc"}`,
      borderRadius: "12px",
      backgroundColor: alpha(colors.cardBg, 0.5),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem"
    },
    loadingSpinner: {
      marginTop: "2rem",
      color: colors.primary
    },
    decorativeIcon: {
      position: 'absolute',
      color: alpha(colors.primary, 0.05),
      zIndex: 0
    }
  };

  // Componente SearchAndCategories simplificado
  const SearchAndCategories = () => {
    return (
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: 2,
        mb: 3
      }}>
        {/* Search bar - Ocupa 60% del espacio en escritorio */}
        <Box sx={{
          flex: isMobile ? 1 : '0.6',
          width: isMobile ? '100%' : '60%'
        }}>
          <TextField
            fullWidth
            placeholder="Buscar preguntas..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HelpOutlineIcon sx={{ color: colors.primary }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                  >
                    <CloseIcon fontSize="small" sx={{ color: colors.secondaryText }} />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={styles.searchField}
          />
        </Box>

        {/* Categories select - Ocupa 40% del espacio en escritorio */}
        <Box sx={{
          flex: isMobile ? 1 : '0.4',
          width: isMobile ? '100%' : '40%'
        }}>
          <TextField
            select
            fullWidth
            value={activeCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            variant="outlined"
            sx={{
              ...styles.searchField,
              "& .MuiSelect-select": {
                display: 'flex',
                alignItems: 'center',
                padding: "14px 16px",
              },
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    backgroundColor: colors.cardBg,
                  }
                }
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <QuestionAnswerIcon sx={{ color: colors.primary }} />
                </InputAdornment>
              ),
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category} sx={{
                fontFamily: "Montserrat, sans-serif",
                color: colors.text,
                "&:hover": {
                  backgroundColor: alpha(colors.primary, 0.1),
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(colors.primary, 0.1),
                }
              }}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        background: colors.background,
        minHeight: "85vh",
        padding: isMobile ? "1.5rem" : "3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: 'hidden'
      }}
    >
      {/* Decorative background icons */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        <LiveHelpIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 300,
          top: '5%',
          left: '5%',
          transform: 'rotate(-15deg)'
        }} />
        <QuestionAnswerIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 200,
          bottom: '10%',
          right: '5%',
          transform: 'rotate(10deg)'
        }} />
        <InfoIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 180,
          top: '30%',
          right: '8%',
          transform: 'rotate(-5deg)'
        }} />
        <HelpOutlineIcon sx={{
          ...styles.decorativeIcon,
          fontSize: 220,
          bottom: '20%',
          left: '8%',
          transform: 'rotate(10deg)'
        }} />
      </Box>

      {/* Header Section con buscador y categorías juntos */}
      <motion.div variants={itemVariants} style={{ width: '100%', maxWidth: '800px' }}>
        <Box sx={styles.header}>
          <Typography variant="h3" sx={styles.title}>
            Preguntas Frecuentes
          </Typography>

          <SearchAndCategories />

        </Box>
      </motion.div>

      {/* Eliminamos el botón de "Mostrar otras preguntas" */}

      {/* FAQs Section */}
      <Box sx={styles.faqContainer}>
        {loadingFaqs ? (
          <SkeletonFAQ />
        ) : filteredFaqs.length > 0 ? (
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={`faq-${index}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Accordion
                  expanded={expandedPanel === `panel${index}`}
                  onChange={handleChange(`panel${index}`)}
                  sx={styles.accordion}
                  TransitionProps={{ unmountOnExit: true }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{
                          color: colors.primary,
                          transition: 'all 0.3s ease',
                          transform: expandedPanel === `panel${index}` ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    }
                    sx={styles.accordionSummary}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      {faq.categoria && (
                        <Chip
                          label={faq.categoria}
                          size="small"
                          sx={{
                            mr: 2,
                            mb: isMobile ? 1 : 0,
                            backgroundColor: `${colors.primary}30`,
                            color: colors.primary,
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: '24px'
                          }}
                        />
                      )}
                      <Typography sx={styles.question}>{faq.question}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{
                    ...styles.accordionDetails,
                    '& p': {
                      marginBottom: '1rem',
                      lineHeight: 1.8,
                    },
                    '& ul': {
                      marginBottom: '1rem',
                      paddingLeft: '1.5rem',
                    },
                    '& li': {
                      marginBottom: '0.5rem',
                      lineHeight: 1.6,
                    },
                    '& strong': {
                      fontWeight: 600,
                      color: isDarkTheme ? alpha(colors.primary, 0.9) : colors.primary,
                    }
                  }}>
                    <Box sx={styles.answer}>
                      {faq.answer}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={styles.noFaqsMessage}>
              <ContactSupportIcon fontSize="large" color="action" />
              {searchQuery ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    No se encontraron resultados
                  </Typography>
                  <Typography variant="body2">
                    No hay coincidencias para "{searchQuery}". Intenta con otra búsqueda o haz tu pregunta directamente.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    No hay preguntas disponibles
                  </Typography>
                  <Typography variant="body2">
                    Actualmente no hay preguntas frecuentes disponibles en esta categoría.
                  </Typography>
                </>
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpenModal(true)}
                startIcon={<EmailIcon />}
                sx={{ mt: 2 }}
              >
                Hacer una pregunta
              </Button>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Ask Question Button */}
      {filteredFaqs.length > 0 && (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outlined"
            size="medium"
            startIcon={<LiveHelpIcon />}
            onClick={() => setOpenModal(true)}
            sx={styles.askButton}
          >
            ¿Tienes otra pregunta?
          </Button>
        </motion.div>
      )}

      {/* Question Form Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        sx={styles.modal}
        ref={dialogRef}
      >
        <AnimatePresence>
          {openModal && (
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Box sx={styles.modalHeader}>
                <Typography variant="h6" sx={styles.modalTitle}>
                  <QuestionAnswerIcon /> Hacer una pregunta
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={() => setOpenModal(false)}
                  sx={{ color: '#ffffff' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <DialogContent sx={styles.modalContent}>
                <Box component="form">
                  <TextField
                    name="email"
                    label="Correo electrónico"
                    fullWidth
                    value={formData.email}
                    onChange={handleFormChange}
                    onBlur={checkEmailInDatabase}
                    required
                    type="email"
                    InputProps={{
                      startAdornment: (
                        <Box component={MarkEmailReadIcon} sx={{ mr: 1.5, color: colors.primary, opacity: formData.isRegistered ? 1 : 0.6 }} />
                      )
                    }}
                    sx={styles.textField}
                  />

                  <TextField
                    name="name"
                    label="Nombre"
                    fullWidth
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    disabled={formData.isRegistered}
                    InputProps={{
                      startAdornment: (
                        <Box component={formData.isRegistered ? CheckCircleIcon : null} sx={{ mr: 1.5, color: 'success.main' }} />
                      )
                    }}
                    sx={styles.textField}
                  />

                  <TextField
                    name="question"
                    label="Tu pregunta"
                    fullWidth
                    value={formData.question}
                    onChange={handleFormChange}
                    sx={styles.textField}
                    required
                    multiline
                    rows={4}
                  />

                  <Box sx={styles.captchaContainer}>
                    <CustomRecaptcha
                      onCaptchaChange={handleCaptchaChange}
                      isDarkMode={isDarkTheme}
                    />
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={styles.dialogActions}>
                <Button
                  onClick={() => setOpenModal(false)}
                  sx={{
                    fontFamily: "Montserrat, sans-serif",
                    color: colors.secondaryText
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={!captchaVerified}
                  startIcon={<SendIcon />}
                  sx={{
                    background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                    color: "#ffffff",
                    fontFamily: "Montserrat, sans-serif",
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    padding: '8px 24px',
                    fontWeight: 600,
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: colors.placeholder,
                      color: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  Enviar pregunta
                </Button>
              </DialogActions>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>

      {/* Notification Component */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </motion.div>
  );
};

export default FAQ;