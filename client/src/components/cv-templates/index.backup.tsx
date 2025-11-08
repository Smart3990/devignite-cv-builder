import type { Cv } from "@shared/schema";
import { Award, Code, Zap, Shield, Star, CheckCircle2, Sparkles } from "lucide-react";

// Template Props Interface
interface TemplateProps {
  data: Cv;
}

// Azurill - Clean single-column ATS-friendly layout
export function AzurillTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-12 min-h-[1056px]">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-4 mb-6">
        <div className="flex items-start gap-6">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">{data.fullName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>•</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>•</span>}
              {data.location && <span>{data.location}</span>}
            </div>
            {(data.website || data.linkedin) && (
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-600">
                {data.website && <a href={data.website} className="hover:underline">{data.website}</a>}
                {data.linkedin && <a href={data.linkedin} className="hover:underline">LinkedIn</a>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg">{exp.title}</h3>
                  <span className="text-sm text-gray-600">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-gray-700 font-semibold mb-1">{exp.company}{exp.location && `, ${exp.location}`}</p>
                <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold">{edu.degree}</h3>
                  <span className="text-sm text-gray-600">
                    {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-gray-700">{edu.institution}{edu.location && `, ${edu.location}`}</p>
                {edu.description && <p className="text-gray-600 text-sm mt-1">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills - Rounded rectangle badges with vibrant colors */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => {
              const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-red-600', 'bg-orange-600', 'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-sky-600'];
              return (
                <span key={index} className={`${colors[index % colors.length]} text-white px-3 py-1.5 rounded-md text-sm font-medium`}>
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Bronzor - Bold two-column design
export function BronzorTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 min-h-[1056px]">
      {/* Header with colored background */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8">
        <div className="flex items-center gap-6">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-28 h-28 rounded-full object-cover border-4 border-white flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{data.fullName}</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>|</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>|</span>}
              {data.location && <span>{data.location}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 p-8">
        {/* Left Column */}
        <div className="col-span-1 space-y-6">
          {/* Skills - Outlined pills with border only */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-orange-600 mb-3 pb-2 border-b-2 border-orange-600">SKILLS</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span key={index} className="border-2 border-orange-600 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-orange-600 mb-3 pb-2 border-b-2 border-orange-600">EDUCATION</h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-bold text-gray-900">{edu.degree}</p>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-gray-600 text-xs">
                      {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          {data.summary && (
            <div>
              <h2 className="text-lg font-bold text-orange-600 mb-3 pb-2 border-b-2 border-orange-600">PROFILE</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-orange-600 mb-3 pb-2 border-b-2 border-orange-600">EXPERIENCE</h2>
              <div className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-700 text-sm font-semibold">{exp.company}</p>
                    <p className="text-gray-600 text-xs mb-2">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-gray-700 text-sm whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Chikorita - Fresh modern layout with green accents
export function ChikoritaTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-10 min-h-[1056px]">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-4 border-green-500">
        {data.photoUrl && (
          <img 
            src={data.photoUrl} 
            alt={data.fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-green-500 mx-auto mb-4"
          />
        )}
        <h1 className="text-5xl font-bold mb-3 text-gray-900">{data.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        {(data.website || data.linkedin) && (
          <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-green-600">
            {data.website && <a href={data.website}>{data.website}</a>}
            {data.linkedin && <a href={data.linkedin}>LinkedIn Profile</a>}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-green-600 mb-3">About Me</h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Professional Experience</h2>
          <div className="space-y-5">
            {data.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <div className="flex justify-between items-baseline flex-wrap gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
                  <span className="text-sm text-gray-600 font-medium">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-gray-700 font-semibold mb-2">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills - Icon + label pills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
                  <Code className="h-3.5 w-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Ditto - Flexible minimalist design
export function DittoTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-12 min-h-[1056px]">
      {/* Header - Simple and clean */}
      <div className="mb-8 flex items-center gap-6">
        {data.photoUrl && (
          <img 
            src={data.photoUrl} 
            alt={data.fullName}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h1 className="text-5xl font-light mb-3 text-gray-900 tracking-tight">{data.fullName}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>•</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>•</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed text-lg">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">{exp.title}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills - Multi-color tags with different colors */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => {
              const colorPairs = [
                { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
                { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
                { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
                { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
                { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
                { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
                { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
                { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
              ];
              const colors = colorPairs[index % colorPairs.length];
              return (
                <span key={index} className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-1 rounded-md text-sm font-medium`}>
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Gengar - Dark elegant template
export function GengarTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-gray-900 text-gray-100 p-10 min-h-[1056px]">
      {/* Header */}
      <div className="border-b border-purple-500 pb-6 mb-6">
        <div className="flex items-center gap-6">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 text-purple-400">{data.fullName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-300">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>|</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>|</span>}
              {data.location && <span>{data.location}</span>}
            </div>
          </div>
        </div>
      </div>

      {data.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-purple-400 mb-3">SUMMARY</h2>
          <p className="text-gray-300 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">EXPERIENCE</h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-purple-500 pl-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg text-gray-100">{exp.title}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-gray-300 font-semibold mb-2">{exp.company}</p>
                <p className="text-gray-300 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-purple-400 mb-4">EDUCATION</h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-bold text-gray-100">{edu.degree}</h3>
                  <p className="text-gray-300">{edu.institution}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-purple-400 mb-4">SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-purple-900/30 border border-purple-500 text-purple-200 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Glalie - Cool professional layout with blue theme
export function GlalieTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 min-h-[1056px]">
      <div className="bg-blue-600 text-white p-10">
        <div className="flex items-center gap-6">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-28 h-28 rounded-full object-cover border-4 border-white flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{data.fullName}</h1>
            <div className="text-blue-100">{data.location}</div>
          </div>
        </div>
      </div>

      <div className="p-10">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            {data.summary && (
              <div>
                <h2 className="text-xl font-bold text-blue-600 mb-2 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600"></div>
                  PROFILE
                </h2>
                <p className="text-gray-700">{data.summary}</p>
              </div>
            )}

            {data.experience && data.experience.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600"></div>
                  WORK EXPERIENCE
                </h2>
                <div className="space-y-4">
                  {data.experience.map((exp, index) => (
                    <div key={index}>
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <p className="text-blue-600 font-semibold text-sm">{exp.company}</p>
                      <p className="text-gray-600 text-xs mb-2">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-blue-600 mb-3">CONTACT</h2>
              <div className="space-y-2 text-sm text-gray-700">
                {data.email && <div>{data.email}</div>}
                {data.phone && <div>{data.phone}</div>}
                {data.website && <div className="text-blue-600">{data.website}</div>}
              </div>
            </div>

            {data.skills && data.skills.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-blue-600 mb-3">SKILLS</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => {
                    const levels = ['Advanced', 'Expert', 'Intermediate', 'Proficient'];
                    const level = levels[index % levels.length];
                    return (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                        <div className="text-sm font-semibold text-blue-900">{skill}</div>
                        <div className="text-xs text-blue-600">{level}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.education && data.education.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-blue-600 mb-3">EDUCATION</h2>
                <div className="space-y-3 text-sm">
                  {data.education.map((edu, index) => (
                    <div key={index}>
                      <p className="font-bold text-gray-900">{edu.degree}</p>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-gray-600 text-xs">
                        {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Kakuna - Compact efficient design
export function KakunaTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-8 min-h-[1056px]">
      <div className="border-4 border-gray-900 p-8">
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-900">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-900 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold mb-2">{data.fullName}</h1>
          <div className="text-sm text-gray-700">
            {data.email} {data.phone && `• ${data.phone}`} {data.location && `• ${data.location}`}
          </div>
        </div>

        {data.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold mb-2 uppercase bg-gray-900 text-white px-2 py-1">Summary</h2>
            <p className="text-sm text-gray-700">{data.summary}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold mb-2 uppercase bg-gray-900 text-white px-2 py-1">Experience</h2>
            <div className="space-y-3">
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-sm">{exp.title}, {exp.company}</h3>
                    <span className="text-xs text-gray-600">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-2 uppercase bg-gray-900 text-white px-2 py-1">Education</h2>
              <div className="space-y-2">
                {data.education.map((edu, index) => (
                  <div key={index} className="text-xs">
                    <p className="font-bold">{edu.degree}</p>
                    <p className="text-gray-700">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-2 uppercase bg-gray-900 text-white px-2 py-1">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium inline-block">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Leafish - Nature-inspired organic design
export function LeafishTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-gradient-to-br from-green-50 to-emerald-50 text-gray-900 p-10 min-h-[1056px]">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-10 shadow-xl">
        <div className="mb-8 flex items-start gap-6">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-emerald-600 shadow-lg flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 text-emerald-700">{data.fullName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {data.email && <span className="bg-emerald-100 px-3 py-1 rounded-full">{data.email}</span>}
              {data.phone && <span className="bg-emerald-100 px-3 py-1 rounded-full">{data.phone}</span>}
              {data.location && <span className="bg-emerald-100 px-3 py-1 rounded-full">{data.location}</span>}
            </div>
          </div>
        </div>

        {data.summary && (
          <div className="mb-8 bg-emerald-50 rounded-2xl p-6">
            <p className="text-gray-700 leading-relaxed italic">{data.summary}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
                    <span className="text-sm text-emerald-600">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-emerald-700 font-semibold mb-2">{exp.company}</p>
                  <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">Education</h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span key={index} className="bg-emerald-500/20 border border-emerald-500 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    {skill}
                    <span className="text-xs text-emerald-600">+{Math.floor(Math.random() * 5) + 1}yrs</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Nosepass - Strong structured layout
export function NosepassTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 min-h-[1056px]">
      <div className="bg-gray-800 text-white p-8">
        <div className="flex items-center gap-6">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{data.fullName}</h1>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {data.email && <div>📧 {data.email}</div>}
              {data.phone && <div>📞 {data.phone}</div>}
              {data.location && <div>📍 {data.location}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {data.summary && (
          <div className="mb-6 pb-6 border-b-2 border-gray-800">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">PROFESSIONAL SUMMARY</h2>
            <p className="text-gray-700 text-lg">{data.summary}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="mb-6 pb-6 border-b-2 border-gray-800">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">WORK EXPERIENCE</h2>
            <div className="space-y-5">
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{exp.title}</h3>
                        <p className="text-gray-700 font-semibold">{exp.company}</p>
                      </div>
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">EDUCATION</h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-gray-600 text-sm">
                      {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">SKILLS</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => {
                  const softSkills = ['Communication', 'Teamwork', 'Leadership', 'Problem-Solving', 'Adaptability', 'Time Management', 'Critical Thinking', 'Collaboration', 'Creativity', 'Attention to Detail'];
                  const isSoftSkill = index % 3 === 0;
                  return (
                    <span key={index} className={`${isSoftSkill ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'} px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5`}>
                      {isSoftSkill && <Star className="h-3.5 w-3.5" />}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Onyx - Sleek monochrome design
export function OnyxTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-black text-white p-12 min-h-[1056px]">
      <div className="mb-10 flex items-start gap-8">
        {data.photoUrl && (
          <img 
            src={data.photoUrl} 
            alt={data.fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h1 className="text-6xl font-bold mb-4 tracking-tight">{data.fullName}</h1>
          <div className="h-1 w-32 bg-white mb-4"></div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </div>
      </div>

      {data.summary && (
        <div className="mb-10">
          <p className="text-xl text-gray-300 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6">EXPERIENCE</h2>
          <div className="space-y-8">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{exp.title}</h3>
                    <p className="text-gray-400">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-10">
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">EDUCATION</h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-bold text-lg">{edu.degree}</h3>
                  <p className="text-gray-400">{edu.institution}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-white/10 border border-white/30 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pikachu - Energetic bright template
export function PikachuTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 min-h-[1056px]">
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-10">
        <div className="flex items-center gap-6">
          {data.photoUrl && (
            <img 
              src={data.photoUrl} 
              alt={data.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 text-gray-900">{data.fullName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-800">
              {data.email && <span className="bg-white/30 px-3 py-1 rounded">{data.email}</span>}
              {data.phone && <span className="bg-white/30 px-3 py-1 rounded">{data.phone}</span>}
              {data.location && <span className="bg-white/30 px-3 py-1 rounded">{data.location}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-10">
        {data.summary && (
          <div className="mb-8">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
              <p className="text-gray-700 italic">{data.summary}</p>
            </div>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-yellow-600 mb-4 pb-2 border-b-2 border-yellow-500">EXPERIENCE</h2>
            <div className="space-y-5">
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-bold text-xl text-gray-900">{exp.title}</h3>
                    <span className="text-sm text-gray-600 bg-yellow-100 px-2 py-1 rounded">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-yellow-700 font-semibold mb-2">{exp.company}</p>
                  <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-4 pb-2 border-b-2 border-yellow-500">EDUCATION</h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-gray-600 text-sm">
                      {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-4 pb-2 border-b-2 border-yellow-500">SKILLS</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => {
                  const styles = [
                    { bg: 'bg-yellow-500', text: 'text-white', icon: true },
                    { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: false },
                    { bg: 'bg-amber-500', text: 'text-white', icon: true },
                  ];
                  const style = styles[index % styles.length];
                  return (
                    <span key={index} className={`${style.bg} ${style.text} px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5`}>
                      {style.icon && <Zap className="h-3.5 w-3.5" />}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Rhyhorn - Robust traditional layout
export function RhyhornTemplate({ data }: TemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-12 min-h-[1056px] border-8 border-gray-900">
      <div className="text-center mb-8 pb-6 border-b-4 border-gray-900">
        {data.photoUrl && (
          <img 
            src={data.photoUrl} 
            alt={data.fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-900 mx-auto mb-4"
          />
        )}
        <h1 className="text-5xl font-bold mb-4">{data.fullName}</h1>
        <div className="flex justify-center flex-wrap gap-4 text-sm font-semibold">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>•</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>•</span>}
          {data.location && <span>{data.location}</span>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-center uppercase">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed text-center">{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center uppercase border-b-2 border-gray-900 pb-2">Professional Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="text-center mb-2">
                  <h3 className="font-bold text-xl">{exp.title}</h3>
                  <p className="font-semibold text-gray-700">{exp.company} | {exp.location}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center uppercase border-b-2 border-gray-900 pb-2">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={index} className="text-center">
                <h3 className="font-bold text-lg">{edu.degree}</h3>
                <p className="text-gray-700">{edu.institution}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' })} - {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center uppercase border-b-2 border-gray-900 pb-2">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 border-2 border-gray-900">
                <CheckCircle2 className="h-4 w-4" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Template Renderer - Dynamically selects template based on templateId
export function CVTemplate({ data, templateId }: { data: Cv; templateId?: string }) {
  const id = templateId || data.templateId || "azurill";
  
  switch (id) {
    case "azurill":
      return <AzurillTemplate data={data} />;
    case "bronzor":
      return <BronzorTemplate data={data} />;
    case "chikorita":
      return <ChikoritaTemplate data={data} />;
    case "ditto":
      return <DittoTemplate data={data} />;
    case "gengar":
      return <GengarTemplate data={data} />;
    case "glalie":
      return <GlalieTemplate data={data} />;
    case "kakuna":
      return <KakunaTemplate data={data} />;
    case "leafish":
      return <LeafishTemplate data={data} />;
    case "nosepass":
      return <NosepassTemplate data={data} />;
    case "onyx":
      return <OnyxTemplate data={data} />;
    case "pikachu":
      return <PikachuTemplate data={data} />;
    case "rhyhorn":
      return <RhyhornTemplate data={data} />;
    default:
      return <AzurillTemplate data={data} />;
  }
}
