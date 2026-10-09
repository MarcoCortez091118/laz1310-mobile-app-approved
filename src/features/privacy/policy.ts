/**
 * LA Z 1310 — NeuroMarket privacy notice V1.
 *
 * Draft created for product/legal approval; do NOT distribute to app stores
 * before controller's registered legal entity, address, retention schedule,
 * data processors, applicable jurisdiction and external web URL are verified.
 * The backend must accept this exact version before the mobile build ships.
 */
export const PRIVACY_POLICY_VERSION = 'neuromarket-laz1310-mobile-v1';

export interface PrivacyPolicySection {
  title: string;
  paragraphs: string[];
}

export const NEUROMARKET_PRIVACY_POLICY_ES: PrivacyPolicySection[] = [
  {
    title: 'Responsable y contacto',
    paragraphs: [
      'NeuroMarket opera LA Z 1310 y gestiona la información que proporcionas para utilizar las funciones de la aplicación, de acuerdo con las finalidades descritas en este aviso.',
      'Para consultas de privacidad, solicitudes relacionadas con tus datos personales o asistencia, escribe a Support@neuromarket.io.',
    ],
  },
  {
    title: 'Información que tratamos',
    paragraphs: [
      'Al crear una cuenta podemos tratar tu correo electrónico, nombre público, estado de verificación y preferencias de idioma y zona horaria.',
      'Cuando habilitas notificaciones, utilizamos los identificadores y tokens técnicos necesarios para enviar avisos al dispositivo y respetar tus preferencias.',
      'Si participas en una dinámica, tratamos la información que envías en el formulario, los consentimientos correspondientes y los datos necesarios para registrar y comprobar tu participación. Los campos concretos y las reglas se muestran antes de participar.',
      'Para operar y proteger la aplicación pueden procesarse datos técnicos del dispositivo y de las solicitudes, como identificadores de instalación, información de funcionamiento y registros de seguridad.',
    ],
  },
  {
    title: 'Para qué usamos esa información',
    paragraphs: [
      'Usamos la información para iniciar sesión, gestionar tu perfil, mostrar contenido y programación, procesar participaciones que solicites, enviarte notificaciones si las habilitas y mantener la seguridad y disponibilidad del servicio.',
      'No necesitas crear una cuenta para escuchar la radio o consultar el contenido público disponible.',
    ],
  },
  {
    title: 'Servicios tecnológicos y terceros',
    paragraphs: [
      'La aplicación utiliza servicios de autenticación, infraestructura, almacenamiento, notificaciones y transmisión de radio proporcionados por terceros. Estos proveedores pueden tratar datos técnicos cuando sea necesario para prestar dichos servicios, bajo las condiciones aplicables.',
      'Al acceder a enlaces externos, como plataformas de música o promociones de terceros, se aplican también las políticas de esos servicios.',
    ],
  },
  {
    title: 'Preferencias, conservación y derechos',
    paragraphs: [
      'Puedes cambiar el idioma, la apariencia y tus preferencias de notificaciones desde la aplicación. También puedes desactivar los permisos de notificación en los ajustes del dispositivo.',
      'Conservamos la información durante el tiempo necesario para las finalidades descritas, el funcionamiento de las participaciones y las obligaciones legales aplicables. Puedes solicitar información sobre los plazos y ejercer los derechos que te correspondan escribiendo a Support@neuromarket.io.',
      'Puedes pedir información sobre acceso, corrección o eliminación de datos de tu cuenta mediante el contacto de soporte, sujeto a las obligaciones legales aplicables.',
    ],
  },
  {
    title: 'Cambios al aviso',
    paragraphs: [
      'Si cambia este aviso, la aplicación identificará la nueva versión y podrá solicitar tu aceptación cuando corresponda. La aceptación de versiones anteriores se conserva como registro histórico y no equivale a aceptar una versión nueva.',
    ],
  },
];

export const NEUROMARKET_PRIVACY_POLICY_EN: PrivacyPolicySection[] = [
  {
    title: 'Who operates the app and how to contact us',
    paragraphs: [
      'NeuroMarket operates LA Z 1310 and manages information you provide when using its features for the purposes described in this notice.',
      'For privacy questions, personal-data requests or assistance, contact Support@neuromarket.io.',
    ],
  },
  {
    title: 'Information we process',
    paragraphs: [
      'When you register, we may process your email address, public display name, email verification status, language and time zone preferences.',
      'If you enable notifications, we use the device identifiers and technical push tokens needed to deliver alerts in line with your preferences.',
      'If you enter a promotion or contest, we process the information you submit, relevant consents and the details necessary to record and verify your entry. Each campaign explains its required fields and specific rules before participation.',
      'Device and request information, such as installation identifiers, service diagnostics and security logs, may be processed to keep the app operating securely.',
    ],
  },
  {
    title: 'How we use that information',
    paragraphs: [
      'We use this information to sign you in, manage your profile, display content and schedules, process your requested contest entries, send opted-in notifications and maintain service security and availability.',
      'You do not need to create an account to listen to the radio or view available public content.',
    ],
  },
  {
    title: 'Technology providers and external services',
    paragraphs: [
      'The app uses third-party services for authentication, infrastructure, storage, notifications and radio streaming. Those providers may process technical data as required to provide their services under applicable terms.',
      'External links, such as music platforms or third-party promotions, are also subject to those services’ own privacy practices.',
    ],
  },
  {
    title: 'Preferences, retention and your rights',
    paragraphs: [
      'You can change language, appearance and notification preferences in the app, and disable notification permissions in your device settings.',
      'We retain information as needed for the described purposes, contest operation and applicable legal obligations. To ask about retention periods or exercise applicable privacy rights, contact Support@neuromarket.io.',
      'You can request information about accessing, correcting or deleting account information through support, subject to applicable legal obligations.',
    ],
  },
  {
    title: 'Changes to this notice',
    paragraphs: [
      'If this notice changes, the app will identify the new version and may request your acceptance where required. Acceptance of an earlier version remains in the audit history and does not amount to acceptance of a new version.',
    ],
  },
];
