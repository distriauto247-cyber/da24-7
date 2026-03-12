import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'

export default function ReportProblem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState(null)
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)

  const problemTypes = [
    { icon: '🐛', label: 'Bug technique', value: 'bug' },
    { icon: '📍', label: 'Donnée incorrecte (machine, emplacement, infos)', value: 'incorrect_data' },
    { icon: '❓', label: "Problème d'affichage", value: 'display_issue' },
    { icon: '💡', label: "Suggestion d'amélioration", value: 'suggestion' },
    { icon: '✓', label: 'Autre', value: 'other' },
  ]

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedType || !description.trim()) {
      alert('Veuillez sélectionner un type de problème et décrire celui-ci')
      return
    }

    setLoading(true)

    try {
      // TODO: Upload photo si présente
      let photoUrl = null

      const { error } = await supabase
        .from('reports')
        .insert([
          {
            distributor_id: id,
            type: selectedType,
            description,
            photo_url: photoUrl,
          }
        ])

      if (error) throw error

      alert('Signalement envoyé avec succès !')
      navigate(-1)
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Erreur lors de l\'envoi du signalement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <AlertTriangle size={24} className="text-primary" />
            <h1 className="text-xl font-bold">Signaler un problème</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-center text-accent-gray mb-6">
          Votre retour nous aide à améliorer DA24.7
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de problème */}
          <div>
            <h3 className="font-semibold mb-3">
              Quel type de problème souhaitez-vous signaler ?
            </h3>
            <div className="space-y-2">
              {problemTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 text-left transition-colors ${
                    selectedType === type.value
                      ? 'border-primary bg-secondary'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">Décrivez le problème rencontré</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="où, quand, ce qui ne fonctionne pas"
              className="w-full h-32 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Camera size={24} className="text-accent-gray" />
                  <div>
                    <p className="font-medium">Ajouter une capture</p>
                    <p className="text-sm text-accent-lightgray">Facultatif mais très utile</p>
                  </div>
                </div>
                {photo && (
                  <p className="text-sm text-primary mt-2">Photo sélectionnée: {photo.name}</p>
                )}
              </div>
            </label>
          </div>

          {/* Submit button */}
          <Button type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le signalement'}
          </Button>
        </form>
      </div>
    </div>
  )
}
