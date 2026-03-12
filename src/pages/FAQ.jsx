import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

const faqData = [
  {
    question: "C'est quoi DA24.7 ?",
    answer:
      "DA24.7 est une application communautaire et indépendante qui permet de localiser des distributeurs automatiques accessibles 24h/24 et 7j/7, partout autour de vous.",
  },
  {
    question: "Faut-il créer un compte pour utiliser l'application ?",
    answer:
      "Non. Vous pouvez consulter la carte et les distributeurs sans vous connecter. En revanche, un compte est nécessaire pour enregistrer des favoris, ajouter un distributeur ou signaler un problème.",
  },
  {
    question: "Comment trouver un distributeur près de moi ?",
    answer:
      "La carte se centre automatiquement sur votre position. Vous pouvez aussi rechercher une ville via la barre de recherche, ou utiliser le bouton de localisation pour revenir à votre position actuelle. Des filtres par catégorie sont disponibles : Pain, Pizza, Burger, Alimentaire, Fleurs, Parapharmacie, Autres.",
  },
  {
    question: "Comment ajouter un distributeur manquant ?",
    answer:
      "Une fois connecté, vous pouvez ajouter un distributeur manquant via le bouton dédié. Votre contribution est vérifiée avant d'être publiée.",
  },
  {
    question: "Comment signaler un problème sur un distributeur ?",
    answer:
      "Sur la fiche d'un distributeur, un bouton de signalement est disponible. Connectez-vous à votre compte puis indiquez le problème constaté (machine hors service, informations incorrectes, etc.).",
  },
  {
    question: "Comment enregistrer un distributeur en favori ?",
    answer:
      "Sélectionnez un distributeur sur la carte pour afficher sa fiche, puis appuyez sur le bouton « Ajouter en favori ». Vous devez être connecté pour utiliser cette fonctionnalité.",
  },
  {
    question: "Comment partager un distributeur ?",
    answer:
      "Sur la fiche d'un distributeur, appuyez sur le bouton « Partager » pour envoyer le lien via les applications disponibles sur votre appareil.",
  },
  {
    question: "Je suis propriétaire d'un distributeur, puis-je référencer ma machine ?",
    answer:
      "Oui. Un abonnement dédié aux propriétaires est disponible. Il permet d'accroître la visibilité de votre ou vos machines sur la plateforme.",
  },
  {
    question: "L'application est-elle gratuite ?",
    answer:
      "L'utilisation de base est entièrement gratuite pour tous les utilisateurs. L'abonnement propriétaire est une option payante pour les professionnels souhaitant optimiser leur présence sur la plateforme.",
  },
  {
    question: "Comment nous contacter ?",
    answer:
      "Pour toute question ou problème, vous pouvez nous écrire à : distriauto24.7@gmail.com. Nous faisons de notre mieux pour répondre dans les meilleurs délais.",
  },
]

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-3"
      >
        <span className="font-medium text-gray-800 text-sm leading-snug">{question}</span>
        {open ? (
          <ChevronUp size={18} className="text-primary flex-shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-accent-gray flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-4 text-sm text-accent-lightgray leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">FAQ</h1>
        </div>
      </div>

      {/* Intro */}
      <div className="bg-white mx-4 mt-4 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <HelpCircle size={22} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-accent-lightgray leading-relaxed">
          Retrouvez ici les réponses aux questions les plus fréquentes sur DA24.7.
          Si vous ne trouvez pas votre réponse, contactez-nous à{' '}
          <span className="text-primary font-medium">distriauto24.7@gmail.com</span>.
        </p>
      </div>

      {/* FAQ List */}
      <div className="bg-white mx-4 mt-4 rounded-xl px-4 shadow-sm">
        {faqData.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-accent-lightgray text-xs">
        © DA24.7 – Tous droits réservés
      </div>
    </div>
  )
}
