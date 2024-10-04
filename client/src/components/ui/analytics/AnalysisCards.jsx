import { Card, CardBody, Chip, Progress, Tooltip } from "@nextui-org/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TEMPLATE_SUCCESS, TEMPLATE_DANGER, TEMPLATE_WARNING } from "../../../constant/colors";

const AccentEmotionToneSentimentCard = ({ accentEmotion, toneSentiment }) => (
  <Card className="p-4">
    <CardBody>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Accent and Emotion Analysis</h3>
        <div className="flex justify-between">
          <div>
            <p className="font-medium">Accent:</p>
            <Chip color="primary">{accentEmotion.accent}</Chip>
          </div>
          <div>
            <p className="font-medium">Emotion:</p>
            <Chip color="secondary">{accentEmotion.emotion}</Chip>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Tone and Sentiment Overview</h3>
        <div className="flex justify-between">
          <div>
            <p className="font-medium">Tone:</p>
            <Chip color="warning">{toneSentiment.tone}</Chip>
          </div>
          <div>
            <p className="font-medium">Sentiment:</p>
            <Chip color="danger">{toneSentiment.sentiment}</Chip>
          </div>
        </div>
      </div>
    </CardBody>
  </Card>
);

const PronunciationCard = ({ data }) => (
  <Card className="p-4">
    <CardBody>
      <h3 className="text-lg font-semibold mb-4">Pronunciation Analysis</h3>
      {Object.entries(data).filter(([key]) => key !== '__typename').map(([key, value]) => (
        <div key={key} className="mb-2">
          <p className="font-medium capitalize">{key}:</p>
          <div className="flex justify-between items-center">
            <span>{value.key}</span>
            <Progress value={value.rate * 20} maxValue={100} color="primary" className="w-1/2" />
          </div>
        </div>
      ))}
    </CardBody>
  </Card>
);

const InteractionSpeedCard = ({ data }) => (
  <Card className="p-4">
    <CardBody>
      <h3 className="text-lg font-semibold mb-4">Interaction Speed</h3>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">Speed: <span className="font-normal">{data.speed}</span></p>
          <p className="font-medium">Reflection: <span className="font-normal">{data.reflection}</span></p>
        </div>
        <ResponsiveContainer width="50%" height={100}>
          <BarChart data={[{ name: 'Speed', value: data.rate }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardBody>
  </Card>
);

const FillerWordCard = ({ data }) => (
  <Card className="p-4">
    <CardBody>
      <h3 className="text-lg font-semibold mb-4">Filler Word Analysis</h3>
      <p className="font-medium">Filler Word Count: <span className="font-normal">{data.count}</span></p>
      {data.fillerWords.length > 0 ? (
        <div className="mt-2">
          <p className="font-medium">Filler Words Used:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {data.fillerWords.map((word, index) => (
              <Chip key={index} color="default">{word}</Chip>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-2">No filler words detected.</p>
      )}
    </CardBody>
  </Card>
);

const LoosingPromptContentCard = ({ data }) => {
  const getColor = (value) => {
    if (value <= 2) return TEMPLATE_DANGER;
    if (value <= 3.5) return TEMPLATE_WARNING;
    return TEMPLATE_SUCCESS;
  };

  const getBadgeColor = (key) => {
    if (key === "Yes") return TEMPLATE_SUCCESS;
    if (key === "No") return TEMPLATE_DANGER;
    return TEMPLATE_WARNING;
  };

  return (
    <Card className="p-4">
      <CardBody>
        <h3 className="text-lg font-semibold mb-4">Losing Prompt Content</h3>
        <div className="mb-4">
          <p className="font-medium">Is Losing Content:</p>
          <Chip color={getBadgeColor(data.isLosingContent.key)}>{data.isLosingContent.key}</Chip>
        </div>
        <div className="mb-4">
          <p className="font-medium">Content Loss Rate:</p>
          <div className="flex justify-between items-center">
            <Tooltip content={`${data.isLosingContent.rate.toFixed(1)} / 5`} placement="top">
              <Progress 
                value={data.isLosingContent.rate * 20} 
                maxValue={100} 
                color={getColor(data.isLosingContent.rate)}
                className="w-full" 
              />
            </Tooltip>
          </div>
        </div>
        <div>
          <p className="font-medium">Sections Missed:</p>
          <ul className="list-disc list-inside mt-2">
            {data.sectionsMissed.map((section, index) => (
              <li key={index}>{section}</li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
};

const OverviewCard = ({ data }) => (
  <Card className="p-4">
    <CardBody>
      <h3 className="text-lg font-semibold mb-4">Call Overview</h3>
      <div className="space-y-4">
        <div>
          <p className="font-medium">Abstract Summary:</p>
          <p>{data.abstractSummary}</p>
        </div>
        <div>
          <p className="font-medium">Key Points:</p>
          <p>{data.keyPoints}</p>
        </div>
        <div>
          <p className="font-medium">Action Item:</p>
          <p>{data.actionItem}</p>
        </div>
        <div className="flex justify-between">
          <Chip color="danger">Sentiment: {data.sentiment}</Chip>
          <Chip color="warning">Awareness: {data.awareness}</Chip>
          <Chip color="primary">Proactive: {data.proactive}</Chip>
        </div>
      </div>
    </CardBody>
  </Card>
);

const AnalysisCards = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="md:col-span-2 lg:col-span-3">
      <AccentEmotionToneSentimentCard 
        accentEmotion={data.accentEmotionAnalysis} 
        toneSentiment={data.toneSentimentOverview} 
      />
    </div>
    <PronunciationCard data={data.pronunciationAnalysis} />
    <InteractionSpeedCard data={data.interactionSpeed} />
    <FillerWordCard data={data.fillerWordAnalysis} />
    <LoosingPromptContentCard data={data.loosingPromptContent} />
    <OverviewCard data={data.overview} />
  </div>
);

export default AnalysisCards;