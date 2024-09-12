import { Mic, Phone } from 'lucide-react';

const CallControlPanel = ({ onStartRecording, onStopRecording, isRecording }) => {
    const toggleRecording = () => {
        if (isRecording) {
            onStopRecording();
        } else {
            onStartRecording();
        }
    };

    return (
        <div className="w-full py-2 flex items-center justify-center bg-gradient-to-t from-card via-card/90 to-card/0">
            <div className="px-4 py-2 w-full bg-card border border-border rounded-lg shadow-sm flex items-center gap-4" style={{ opacity: 1, transform: 'translateY(0%) translateZ(0px)' }}>
                <button
                    type="button"
                    aria-pressed={isRecording}
                    onClick={toggleRecording}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isRecording ? 'bg-accent text-accent-foreground' : 'bg-transparent'} h-10 px-3`}
                >
                    <Mic className="size-4" />
                </button>

                <div className="relative grid h-8 shrink grow-0 w-2/3">
                    <div className="relative size-full">
                        <AudioWaveform isRecording={isRecording} />
                    </div>
                </div>

                <button 
                    onClick={toggleRecording}
                    className="justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 flex items-center gap-1 hover:bg-theme-200 dark:hover:bg-theme-700"
                >
                    <span><Phone className="size-4 opacity-50" /></span>
                    <span>{isRecording ? 'End Call' : 'Start Call'}</span>
                </button>
            </div>
        </div>
    );
};

const AudioWaveform = ({ isRecording }) => (
    <div style={{ overflow: 'visible', height: 0, width: 0 }}>
        <svg viewBox="0 0 192 32" width="192" height="32" className="absolute !inset-0 !size-full fill-current">
            {[...Array(108)].map((_, index) => {
                const x = 1.833333333333333 + index * 8;
                const height = isRecording ? 2 + Math.random() * 28 : 2;
                const y = 16 - height / 2;
                return (
                <rect key={index} height={height} width="2" x={x} y={y} rx="4" />
                );
            })}
        </svg>
    </div>
);

export default CallControlPanel;