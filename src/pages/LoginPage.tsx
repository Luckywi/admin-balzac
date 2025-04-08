import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CORRECT_PIN = '1234' // à remplacer plus tard par un système Firebase ou admin

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [errorShake, setErrorShake] = useState(false)
  const navigate = useNavigate()

  const handleClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === CORRECT_PIN) {
            navigate('/dashboard') // redirection si PIN correct
          } else {
            setErrorShake(true)
            setTimeout(() => {
              setErrorShake(false)
              setPin('')
            }, 500)
          }
        }, 200)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Cadenas et titre */}
      <div className="flex flex-col items-center mt-16 mb-12">
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTgwIiB2aWV3Qm94PSIwIDAgMTYwIDE4MCIgZmlsbD0ibm9uZSI+CiAgPHBhdGggZD0iTTEyMCw2MEMxMjAsNDIuNCwxMDcuNiwyOCw5MCwyOEM3Mi40LDI4LDYwLDQyLjQsNjAsNjB2MzBIMTIwVjYweiIgZmlsbD0iI0U4RThFOCIgLz4KICA8cmVjdCB4PSI0MCIgeT0iOTAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIiByeD0iMTYiIHJ5PSIxNiIgZmlsbD0iI0U4RThFOCIgLz4KPC9zdmc+Cg==" 
          alt="Cadenas" 
          className="w-32 h-32 mb-6"
        />
        <h1 className="text-3xl font-normal">Entrer le code</h1>
      </div>

      {/* Points du code PIN (cachés dans l'image) */}
      <div className="flex justify-center mb-8">
        <div className={`flex gap-3 ${errorShake ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                pin.length > i ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Clavier numérique */}
      <div className="flex flex-col px-6 gap-3">
        {/* Rangée 1 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('1')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            1
          </button>
        </div>
        
        {/* Rangée 2 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('2')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            2<span className="ml-2 text-sm text-gray-400">ABC</span>
          </button>
        </div>
        
        {/* Rangée 3 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('3')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            3<span className="ml-2 text-sm text-gray-400">DEF</span>
          </button>
        </div>
        
        {/* Rangée 4 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('4')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            4<span className="ml-2 text-sm text-gray-400">GHI</span>
          </button>
        </div>
        
        {/* Rangée 5 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('5')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            5<span className="ml-2 text-sm text-gray-400">JKL</span>
          </button>
        </div>
        
        {/* Rangée 6 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('6')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            6<span className="ml-2 text-sm text-gray-400">MNO</span>
          </button>
        </div>
        
        {/* Rangée 7 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('7')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            7<span className="ml-2 text-sm text-gray-400">PQRS</span>
          </button>
        </div>
        
        {/* Rangée 8 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('8')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            8<span className="ml-2 text-sm text-gray-400">TUV</span>
          </button>
        </div>
        
        {/* Rangée 9 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('9')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            9<span className="ml-2 text-sm text-gray-400">WXYZ</span>
          </button>
        </div>
        
        {/* Rangée 0 */}
        <div className="h-14 flex">
          <button
            onClick={() => handleClick('0')}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            0
          </button>
        </div>
        
        {/* Rangée Effacer */}
        <div className="h-14 flex">
          <button
            onClick={handleDelete}
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            Effacer
          </button>
        </div>
        
        {/* Rangée Urgence */}
        <div className="h-14 flex">
          <button
            className="w-full h-full text-white text-left px-6 py-3 text-xl focus:outline-none active:bg-gray-800 flex items-center"
          >
            Urgence
          </button>
        </div>
      </div>
    </div>
  )
}