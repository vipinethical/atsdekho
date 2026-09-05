import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { contactBits, formatDates } from "./resume-format";
import type { RewrittenResume } from "./types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1c1917",
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#1c1917",
    paddingBottom: 10,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  headline: {
    marginTop: 4,
    fontSize: 11,
    textAlign: "center",
  },
  contact: {
    marginTop: 6,
    fontSize: 9,
    textAlign: "center",
    color: "#44403c",
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    borderBottomWidth: 0.6,
    borderBottomColor: "#1c1917",
  },
  para: {
    fontSize: 10,
    lineHeight: 1.45,
  },
  jobHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
    gap: 12,
  },
  company: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    flexGrow: 1,
    flexShrink: 1,
  },
  dates: {
    fontSize: 9.5,
    color: "#44403c",
  },
  title: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#44403c",
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 3,
    paddingLeft: 8,
  },
  bulletMark: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
});

function ResumePdf({ resume }: { resume: RewrittenResume }) {
  const bits = contactBits(resume.contactLine);
  return (
    <Document
      title={`${resume.name} — Resume`}
      author={resume.name}
      subject={resume.headline}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          {resume.headline ? <Text style={styles.headline}>{resume.headline}</Text> : null}
          {bits.length ? <Text style={styles.contact}>{bits.join("  |  ")}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.para}>{resume.summary}</Text>

        {resume.skills.length ? (
          <>
            <Text style={styles.sectionTitle}>Key Skills</Text>
            <Text style={styles.para}>{resume.skills.join(", ")}</Text>
          </>
        ) : null}

        {resume.experience.length ? (
          <>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {resume.experience.map((job) => (
              <View key={`${job.company}-${job.dates}`} wrap={false}>
                <View style={styles.jobHead}>
                  <Text style={styles.company}>{job.company}</Text>
                  {job.dates ? (
                    <Text style={styles.dates}>{formatDates(job.dates)}</Text>
                  ) : null}
                </View>
                {job.title && job.title.toLowerCase() !== job.company.toLowerCase() ? (
                  <Text style={styles.title}>{job.title}</Text>
                ) : null}
                {job.bullets.map((line) => (
                  <View key={line} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {resume.education.length ? (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu) => (
              <Text key={edu.line} style={styles.para}>
                {edu.line}
              </Text>
            ))}
          </>
        ) : null}

        {resume.projects.length ? (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project) => (
              <View key={project.name}>
                <Text style={styles.company}>{project.name}</Text>
                {project.bullets.map((line) => (
                  <View key={line} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {resume.certifications.length ? (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert) => (
              <Text key={cert} style={styles.para}>
                {cert}
              </Text>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  );
}

export async function resumeToPdf(resume: RewrittenResume): Promise<Buffer> {
  return renderToBuffer(<ResumePdf resume={resume} />);
}
