import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Gift, RotateCcw, Users, Sparkles, Upload, X } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email?: string;
}

interface Winner {
  participant: Participant;
  timestamp: Date;
}

function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [drawHistory, setDrawHistory] = useState<Winner[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [importFormat, setImportFormat] = useState<'names' | 'nameEmail'>('names');
  const [previewParticipants, setPreviewParticipants] = useState<Participant[]>([]);

  const addParticipant = () => {
    if (!newParticipant.name.trim()) return;
    
    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.name.trim(),
      email: newParticipant.email.trim() || undefined,
    };
    
    setParticipants([...participants, participant]);
    setNewParticipant({ name: '', email: '' });
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const conductDraw = async () => {
    if (participants.length === 0) return;
    
    setIsDrawing(true);
    setCurrentWinner(null);
    
    // Simulate drawing animation with multiple random selections
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const randomIndex = Math.floor(Math.random() * participants.length);
      setCurrentWinner({
        participant: participants[randomIndex],
        timestamp: new Date(),
      });
    }
    
    // Final winner selection
    await new Promise(resolve => setTimeout(resolve, 500));
    const finalWinnerIndex = Math.floor(Math.random() * participants.length);
    const winner: Winner = {
      participant: participants[finalWinnerIndex],
      timestamp: new Date(),
    };
    
    setCurrentWinner(winner);
    setDrawHistory([winner, ...drawHistory]);
    setIsDrawing(false);
    setShowCelebration(true);
    
    // Remove celebration after 3 seconds
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const resetDraw = () => {
    setParticipants([]);
    setCurrentWinner(null);
    setIsDrawing(false);
    setShowCelebration(false);
  };

  const resetWinner = () => {
    setCurrentWinner(null);
    setShowCelebration(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setBatchText(text);
      parseParticipants(text);
    };
    reader.readAsText(file);
  };

  const parseParticipants = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: Participant[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      if (importFormat === 'names') {
        parsed.push({
          id: `batch-${Date.now()}-${index}`,
          name: trimmedLine,
        });
      } else {
        const parts = trimmedLine.split(/[,\t]/).map(part => part.trim());
        if (parts.length >= 1) {
          parsed.push({
            id: `batch-${Date.now()}-${index}`,
            name: parts[0],
            email: parts[1] || undefined,
          });
        }
      }
    });

    setPreviewParticipants(parsed);
  };

  const importParticipants = () => {
    const existingNames = new Set(participants.map(p => p.name.toLowerCase()));
    const newParticipants = previewParticipants.filter(
      p => !existingNames.has(p.name.toLowerCase())
    );
    
    setParticipants([...participants, ...newParticipants]);
    setShowBatchImport(false);
    setBatchText('');
    setPreviewParticipants([]);
  };

  const closeBatchImport = () => {
    setShowBatchImport(false);
    setBatchText('');
    setPreviewParticipants([]);
  };

  useEffect(() => {
    if (batchText) {
      parseParticipants(batchText);
    } else {
      setPreviewParticipants([]);
    }
  }, [batchText, importFormat]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 opacity-20 animate-pulse"></div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Batch Import Modal */}
      {showBatchImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Batch Import Participants</h3>
              <button
                onClick={closeBatchImport}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Import Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="names"
                      checked={importFormat === 'names'}
                      onChange={(e) => setImportFormat(e.target.value as 'names' | 'nameEmail')}
                      className="mr-2"
                    />
                    Names Only
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="nameEmail"
                      checked={importFormat === 'nameEmail'}
                      onChange={(e) => setImportFormat(e.target.value as 'names' | 'nameEmail')}
                      className="mr-2"
                    />
                    Name & Email
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Manual Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Paste Text</label>
                <textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={
                    importFormat === 'names'
                      ? "John Doe\nJane Smith\nBob Johnson"
                      : "John Doe, john@example.com\nJane Smith, jane@example.com\nBob Johnson, bob@example.com"
                  }
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Preview */}
              {previewParticipants.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Preview ({previewParticipants.length} participants)
                  </h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {previewParticipants.slice(0, 10).map((participant, index) => (
                      <div key={participant.id} className="flex items-center gap-2 py-1">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <span className="font-medium">{participant.name}</span>
                        {participant.email && (
                          <span className="text-sm text-gray-500">({participant.email})</span>
                        )}
                      </div>
                    ))}
                    {previewParticipants.length > 10 && (
                      <div className="text-sm text-gray-500 mt-2">
                        ... and {previewParticipants.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={importParticipants}
                  disabled={previewParticipants.length === 0}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Import {previewParticipants.length} Participants
                </button>
                <button
                  onClick={closeBatchImport}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Lucky Draw</h1>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <p className="text-white/80 text-lg">Add participants and let luck decide the winner!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Add Participants */}
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-purple-600" />
                  Add Participants
                </h2>
                <button
                  onClick={() => setShowBatchImport(true)}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                  title="Batch Import"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                    placeholder="Enter participant name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <button
                  onClick={addParticipant}
                  disabled={!newParticipant.name.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Add Participant
                </button>
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Participants ({participants.length})
              </h3>
              
              {participants.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No participants yet. Add some to get started!</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{participant.name}</p>
                          {participant.email && (
                            <p className="text-sm text-gray-500">{participant.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeParticipant(participant.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Draw Section */}
          <div className="space-y-6">
            {/* Draw Controls */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Gift className="w-6 h-6 text-yellow-600" />
                Lucky Draw
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={conductDraw}
                  disabled={participants.length === 0 || isDrawing}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {isDrawing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Drawing...
                    </span>
                  ) : (
                    `Draw Winner ${participants.length > 0 ? `(${participants.length} entries)` : ''}`
                  )}
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={resetWinner}
                    disabled={!currentWinner}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors duration-200"
                  >
                    Clear Winner
                  </button>
                  <button
                    onClick={resetDraw}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All
                  </button>
                </div>
              </div>
            </div>

            {/* Winner Display */}
            {currentWinner && (
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-xl transform animate-pulse">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  🎉 WINNER! 🎉
                </h3>
                <div className="bg-white/90 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    👑
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentWinner.participant.name}
                  </h4>
                  {currentWinner.participant.email && (
                    <p className="text-gray-600 mb-2">{currentWinner.participant.email}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Won on {currentWinner.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Draw History */}
            {drawHistory.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Draw History</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {drawHistory.slice(0, 10).map((winner, index) => (
                    <div
                      key={winner.timestamp.getTime()}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{winner.participant.name}</p>
                          <p className="text-xs text-gray-500">
                            {winner.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-yellow-500 text-lg">🏆</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">{participants.length}</p>
              <p className="text-sm text-gray-600">Total Participants</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{drawHistory.length}</p>
              <p className="text-sm text-gray-600">Draws Conducted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {participants.length > 0 ? Math.round((1 / participants.length) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Win Probability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;