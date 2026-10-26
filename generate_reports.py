import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

import reportlab
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def style_academic_table(table, col_widths, header_bg="E2E8F0"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if is_header:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

        for j, cell in enumerate(row.cells):
            if j < len(col_widths):
                cell.width = col_widths[j]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            
            # Subtle academic light-grey border
            tcPr = cell._tc.get_or_add_tcPr()
            borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tcBorders>')
            tcPr.append(borders)

            if is_header:
                set_cell_background(cell, header_bg)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(3)
                    p.paragraph_format.space_after = Pt(3)
                    for r in p.runs:
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(0, 0, 0)
                        r.font.size = Pt(9.5)
            else:
                set_cell_background(cell, "FFFFFF" if i % 2 == 0 else "F8FAFC")
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    for r in p.runs:
                        r.font.color.rgb = RGBColor(0, 0, 0)
                        r.font.size = Pt(9)

def add_image_or_placeholder(doc, img_path, title, instruction, caption, width_in=5.8):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.paragraph_format.space_after = Pt(4)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(width_in))
        
        cap_p = doc.add_paragraph()
        cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap_p.paragraph_format.space_before = Pt(2)
        cap_p.paragraph_format.space_after = Pt(12)
        r_cap = cap_p.add_run(caption)
        r_cap.font.bold = True
        r_cap.font.size = Pt(9.5)
        r_cap.font.color.rgb = RGBColor(0, 0, 0)
    else:
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.2)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/><w:left w:val="single" w:sz="18" w:space="0" w:color="475569"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/><w:right w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/></w:tcBorders>')
        tcPr.append(borders)

        p1 = cell.paragraphs[0]
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(f"📷 [SCREENSHOT PLACEHOLDER: {title}]")
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(0, 0, 0)

        p2 = cell.add_paragraph()
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(2)
        r2 = p2.add_run(instruction)
        r2.font.italic = True
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = RGBColor(71, 85, 105)

        cap_p = doc.add_paragraph()
        cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap_p.paragraph_format.space_before = Pt(3)
        cap_p.paragraph_format.space_after = Pt(10)
        r_cap = cap_p.add_run(caption)
        r_cap.font.bold = True
        r_cap.font.size = Pt(9.5)
        r_cap.font.color.rgb = RGBColor(0, 0, 0)

def build_academic_docx(output_path, rep_dir):
    doc = Document()
    
    # 1-inch margins on all sides
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.header.is_linked_to_previous = False
        section.footer.is_linked_to_previous = False

    # -------------------------------------------------------------
    # 1. COVER PAGE (Standard Black & White Academic Style)
    # -------------------------------------------------------------
    logo_path = os.path.join(rep_dir, "college_logo.png")
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(6)
    p_logo.paragraph_format.space_after = Pt(10)
    if os.path.exists(logo_path):
        p_logo.add_run().add_picture(logo_path, width=Inches(2.5))

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(2)
    p_inst.paragraph_format.space_after = Pt(2)
    r_inst1 = p_inst.add_run("G H RAISONI COLLEGE OF ENGINEERING & MANAGEMENT,\nWAGHOLI, PUNE\n")
    r_inst1.font.bold = True
    r_inst1.font.size = Pt(13)
    r_inst1.font.color.rgb = RGBColor(0, 0, 0)
    
    r_inst2 = p_inst.add_run("(An Empowered Autonomous Institute, Affiliated to Savitribai Phule Pune University, Approved by AICTE, New Delhi and Recognized by Govt. of Maharashtra, NAAC ACCREDITED A+ Grade)\n")
    r_inst2.font.size = Pt(8.5)
    r_inst2.font.color.rgb = RGBColor(51, 65, 85)

    p_minor = doc.add_paragraph()
    p_minor.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_minor.paragraph_format.space_before = Pt(14)
    p_minor.paragraph_format.space_after = Pt(4)
    r_minor = p_minor.add_run("Minor Degree in Cyber Security\nTAE-2\nSubject: Fundamental of Cyber Security & Cryptography\n")
    r_minor.font.bold = True
    r_minor.font.size = Pt(12)
    r_minor.font.color.rgb = RGBColor(0, 0, 0)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(20)
    p_title.paragraph_format.space_after = Pt(20)
    r_tit1 = p_title.add_run("Mini Project Report On\n")
    r_tit1.font.bold = True
    r_tit1.font.size = Pt(16)
    r_tit1.font.color.rgb = RGBColor(0, 0, 0)
    r_tit2 = p_title.add_run("“Sentinel: Next-Generation Firewall & Intrusion Detection System”\n")
    r_tit2.font.bold = True
    r_tit2.font.size = Pt(17)
    r_tit2.font.color.rgb = RGBColor(0, 0, 0)

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_before = Pt(14)
    p_guide.paragraph_format.space_after = Pt(18)
    r_g1 = p_guide.add_run("Guided By:-\n")
    r_g1.font.bold = True
    r_g1.font.size = Pt(13)
    r_g2 = p_guide.add_run("Prof. Birudev Yele\n\n")
    r_g2.font.bold = True
    r_g2.font.size = Pt(14)
    r_g2.font.color.rgb = RGBColor(0, 0, 0)

    r_s1 = p_guide.add_run("Submitted by:\n")
    r_s1.font.bold = True
    r_s1.font.size = Pt(13)
    r_s2 = p_guide.add_run("AMMAR RAISAHMAD MULLA\n")
    r_s2.font.bold = True
    r_s2.font.size = Pt(14)
    r_s2.font.color.rgb = RGBColor(0, 0, 0)

    p_footer = doc.add_paragraph()
    p_footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_footer.paragraph_format.space_before = Pt(22)
    p_footer.paragraph_format.space_after = Pt(0)
    r_foot = p_footer.add_run("Academic Year 2026-27\nSemester-V")
    r_foot.font.bold = True
    r_foot.font.size = Pt(11)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. CERTIFICATE PAGE
    # -------------------------------------------------------------
    p_c_head = doc.add_paragraph()
    p_c_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c_head.paragraph_format.space_before = Pt(14)
    p_c_head.paragraph_format.space_after = Pt(22)
    r_c_head = p_c_head.add_run("CERTIFICATE")
    r_c_head.font.bold = True
    r_c_head.font.size = Pt(15)
    r_c_head.font.color.rgb = RGBColor(0, 0, 0)

    p_cert = doc.add_paragraph()
    p_cert.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_cert.paragraph_format.line_spacing = 1.3
    p_cert.paragraph_format.space_after = Pt(36)
    p_cert.add_run("This is to certify that the mini project entitled ")
    r_c_tit = p_cert.add_run("“Sentinel: Next-Generation Firewall & Intrusion Detection System”")
    r_c_tit.font.bold = True
    p_cert.add_run(" embodies the original work done by ")
    r_c_name = p_cert.add_run("AMMAR RAISAHMAD MULLA")
    r_c_name.font.bold = True
    p_cert.add_run(" as a partial fulfilment of the requirement of TAE-2 for the subject ")
    r_c_sub = p_cert.add_run("Fundamental of Cyber Security & Cryptography")
    r_c_sub.font.bold = True
    p_cert.add_run(" under the Minor Degree in Cyber Security, Third Year B. Tech., Semester V, during the academic year 2026-2027.")

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(60)
    p_meta.add_run("Date: 01/10/2026\nPlace: Pune")

    sig_tbl = doc.add_table(rows=1, cols=2)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_tbl.rows[0].cells[0].width = Inches(3.2)
    sig_tbl.rows[0].cells[1].width = Inches(3.2)
    
    p_sig1 = sig_tbl.rows[0].cells[0].paragraphs[0]
    p_sig1.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_s1 = p_sig1.add_run("Prof. Birudev Yele\n")
    r_s1.font.bold = True
    p_sig1.add_run("Project Guide")

    p_sig2 = sig_tbl.rows[0].cells[1].paragraphs[0]
    p_sig2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_s2 = p_sig2.add_run("Mrs. Sarita Patil\n")
    r_s2.font.bold = True
    p_sig2.add_run("Head of Department")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 3. ACKNOWLEDGEMENT PAGE
    # -------------------------------------------------------------
    p_ack_head = doc.add_paragraph()
    p_ack_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack_head.paragraph_format.space_before = Pt(14)
    p_ack_head.paragraph_format.space_after = Pt(22)
    r_ack_head = p_ack_head.add_run("ACKNOWLEDGEMENT")
    r_ack_head.font.bold = True
    r_ack_head.font.size = Pt(15)
    r_ack_head.font.color.rgb = RGBColor(0, 0, 0)

    p_ack1 = doc.add_paragraph()
    p_ack1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack1.paragraph_format.line_spacing = 1.3
    p_ack1.paragraph_format.space_after = Pt(12)
    p_ack1.add_run("I would like to express my sincere gratitude to ")
    r_a_guide = p_ack1.add_run("Prof. Birudev Yele")
    r_a_guide.font.bold = True
    p_ack1.add_run(", my project guide, for his valuable guidance, constant encouragement, and technical support throughout the development of this mini project on the ")
    r_a_proj = p_ack1.add_run("Sentinel: Next-Generation Firewall & Intrusion Detection System")
    r_a_proj.font.bold = True
    p_ack1.add_run(". His insights into network security architecture, packet filtering paradigms, and heuristic intrusion detection algorithms helped shape both the implementation and this report.")

    p_ack2 = doc.add_paragraph()
    p_ack2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack2.paragraph_format.line_spacing = 1.3
    p_ack2.paragraph_format.space_after = Pt(12)
    p_ack2.add_run("I am deeply thankful to ")
    r_a_hod = p_ack2.add_run("Mrs. Sarita Patil")
    r_a_hod.font.bold = True
    p_ack2.add_run(", Head of the Department of Computer Engineering, for providing the necessary computing facilities, laboratory infrastructure, and an inspiring academic environment. I also extend my thanks to all staff members of the Department of Computer Engineering for their cooperation whenever required.")

    p_ack3 = doc.add_paragraph()
    p_ack3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack3.paragraph_format.line_spacing = 1.3
    p_ack3.paragraph_format.space_after = Pt(24)
    p_ack3.add_run("Finally, I extend my heartfelt gratitude to my family and friends, and to everyone who helped me directly or indirectly in the successful completion of this project.")

    p_ack_sub = doc.add_paragraph()
    p_ack_sub.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_ack_sub.paragraph_format.space_before = Pt(20)
    r_asub = p_ack_sub.add_run("AMMAR RAISAHMAD MULLA\nThird Year B. Tech. (Cyber Security Minor)\nDepartment of Computer Engineering")
    r_asub.font.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # 4. INDEX / TABLE OF CONTENTS
    # -------------------------------------------------------------
    p_idx_head = doc.add_paragraph()
    p_idx_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_idx_head.paragraph_format.space_before = Pt(14)
    p_idx_head.paragraph_format.space_after = Pt(18)
    r_idx_head = p_idx_head.add_run("INDEX")
    r_idx_head.font.bold = True
    r_idx_head.font.size = Pt(15)
    r_idx_head.font.color.rgb = RGBColor(0, 0, 0)

    index_data = [
        ("Sr. No", "Title", "Page No"),
        ("1.", "Problem Definition & Objectives", "1"),
        ("2.", "Introduction & Theoretical Background", "2"),
        ("3.", "System Architecture & Data Pipelines", "5"),
        ("4.", "Implementation: Design Web Pages & UI Modules", "7"),
        ("5.", "Algorithms & Working Mechanism", "11"),
        ("6.", "Technology Stack & Deployment Architecture", "13"),
        ("7.", "Results, Verification & Testing", "15"),
        ("8.", "Conclusion & Future Scope", "18"),
        ("9.", "References & Project Repositories", "19")
    ]

    idx_tbl = doc.add_table(rows=len(index_data), cols=3)
    for r_idx, row_values in enumerate(index_data):
        row = idx_tbl.rows[r_idx]
        for c_idx, val in enumerate(row_values):
            cell = row.cells[c_idx]
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx == 1 else WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(val)
            if r_idx == 0:
                run.font.bold = True
    
    style_academic_table(idx_tbl, [Inches(1.0), Inches(4.5), Inches(1.0)], header_bg="E2E8F0")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 1: PROBLEM DEFINITION & OBJECTIVES
    # -------------------------------------------------------------
    h1 = doc.add_heading("1. Problem Definition & Objectives", level=1)
    for r in h1.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    doc.add_heading("Problem Definition", level=2)
    p_prob = doc.add_paragraph()
    p_prob.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_prob.paragraph_format.line_spacing = 1.2
    p_prob.paragraph_format.space_after = Pt(8)
    p_prob.add_run(
        "Modern enterprise computing infrastructure and cloud networks are subjected to persistent, highly automated adversarial cyber-attacks. These range from volumetric Distributed Denial of Service (DDoS) vectors—such as TCP SYN floods designed to saturate server transmission control block (TCB) memory queues—to automated horizontal and vertical port scanning recon probes seeking vulnerabilities across critical administrative daemons (SSH port 22, RDP port 3389, and SMB port 445).\n\n"
        "Traditional enterprise firewall utilities, including Linux iptables or hardware appliance command-line interfaces (CLIs), function as opaque black boxes. They provide static, text-heavy tabular logs that lack real-time interactive telemetry, visual threat trajectory mapping, and dynamic feedback. Consequently, cybersecurity students, SecOps practitioners, and network administrators struggle to intuitively conceptualize how incoming network packets traverse firewall rule chains, evaluate priority policies, trigger intrusion detection thresholds, and execute automated drops. Furthermore, academic simulation tools often rely entirely on synthetic dummy placeholders disconnected from real operating system network sockets and persistent databases, severely undermining hands-on educational value."
    )

    doc.add_heading("Objectives", level=2)
    objectives = [
        ("Layer 4 Stateful Packet Inspection & Policy Enforcement: ", "To develop a high-throughput firewall engine capable of evaluating incoming TCP/UDP/ICMP packets in real time against user-configured network policies (IP address, destination port, transport protocol) and enforcing deterministic ALLOW or DROP verdicts."),
        ("Heuristic Intrusion Detection System (IDS): ", "To implement an anomaly detection engine that continuously analyzes incoming network streams for anomalous threat vectors, specifically flagging TCP SYN Floods (MITRE ATT&CK T1498.001), automated port sweepers, and credential brute-forcing probes."),
        ("Interactive Network Topology Mesh Graph: ", "To design and engineer an interactive, draggable network topology graph using SVG vector math and cubic Bézier curves, providing visual representations of external threats, the central Sentinel Firewall Hub, and protected internal LAN assets with live traveling packet particle animations."),
        ("Live Adversary Attack Simulation Console: ", "To create an integrated attack simulation control panel allowing security personnel to launch authentic cyber-threat vectors on demand, accelerating packet transmission to validate real-time dropping and counter increments under peak stress."),
        ("Dual Operational Modes & Native OS Socket Bridge: ", "To support both 'Live Network Mode' (sniffing real host TCP sockets via Server-Sent Events from a Node.js backend bridge) and 'Simulation Mode' (for deterministic demonstration environments)."),
        ("SecOps AI Forensic Analyst: ", "To integrate an intelligent SecOps assistant capable of performing automated root-cause analysis on flagged attacker IPs and generating automated iptables mitigation rules."),
        ("Relational Database Persistence: ", "To persist firewall policies and packet audit trails in a relational MySQL database ('firewall_db'), maintaining accurate hit counters and byte metrics across browser reloads.")
    ]

    for title, desc in objectives:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.paragraph_format.space_after = Pt(4)
        p_item.paragraph_format.line_spacing = 1.15
        r_title = p_item.add_run(title)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(0, 0, 0)
        p_item.add_run(desc)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 2: INTRODUCTION & THEORETICAL BACKGROUND
    # -------------------------------------------------------------
    h2 = doc.add_heading("2. Introduction & Theoretical Background", level=1)
    for r in h2.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_intro = doc.add_paragraph()
    p_intro.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_intro.paragraph_format.line_spacing = 1.2
    p_intro.paragraph_format.space_after = Pt(8)
    p_intro.add_run(
        "The Sentinel Firewall & Intrusion Detection System (IDS) is an advanced SecOps platform designed to bridge the gap between abstract network security theory and real-world tactical defense. It combines stateful packet evaluation, heuristic threat signature matching, live network socket streaming, relational database accounting, and interactive topology modeling into a unified single-page application. This chapter explores the foundational theoretical principles underpinning the system."
    )

    doc.add_heading("2.1 Next-Generation Firewalls (NGFW) vs Traditional Packet Filters", level=2)
    p_ngfw = doc.add_paragraph()
    p_ngfw.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ngfw.paragraph_format.line_spacing = 1.2
    p_ngfw.paragraph_format.space_after = Pt(8)
    p_ngfw.add_run(
        "Traditional firewalls operate primarily as stateless packet filters at the Network (Layer 3) and Transport (Layer 4) layers of the OSI model. They inspect packet headers—specifically source IP, destination IP, protocol number, and source/destination ports—in total isolation, without maintaining context regarding the state of the connection. In contrast, Next-Generation Firewalls (NGFWs) introduce stateful inspection and deep packet inspection, actively tracking the status of TCP handshakes (SYN, SYN-ACK, ESTABLISHED, FIN/RST) and inspecting payload behaviors. Sentinel implements stateful policy enforcement combined with real-time heuristic anomaly detection."
    )

    doc.add_heading("2.2 Core Threat Vectors & Attack Models", level=2)
    p_threats = doc.add_paragraph()
    p_threats.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_threats.paragraph_format.line_spacing = 1.2
    p_threats.paragraph_format.space_after = Pt(8)
    p_threats.add_run(
        "• TCP SYN Flood (DDoS Attack): Under RFC 793, establishing a standard TCP connection requires a three-way handshake (SYN -> SYN-ACK -> ACK). In a SYN Flood, an adversary transmits rapid streams of SYN requests with forged or unacknowledged source addresses. The target server allocates kernel memory for half-open sockets in its listen backlog queue. When the queue overflows, legitimate incoming connections are refused. Sentinel detects this anomaly when SYN frame frequency exceeds calibrated thresholds and initiates immediate automated drops.\n"
        "• Port Reconnaissance & Scanning: Attackers utilize tools such as Nmap to identify active listening services on a host. By sending SYN probes across common ports (21, 22, 23, 25, 80, 135, 443, 445, 1433, 3389), the scanner determines open attack surfaces. Sentinel tracks port variety per source IP to intercept port sweeps.\n"
        "• Credential Brute-Force Probes: High-frequency connection requests targeting port 22 (SSH) or port 3389 (RDP) represent automated credential stuffing bots attempting password dictionary attacks."
    )

    # Page Break before Table 1 so it NEVER splits across pages!
    doc.add_page_break()

    doc.add_heading("Table 1 : Traditional Firewalls vs Sentinel Next-Gen Firewall", level=3)
    t1_data = [
        ("Parameter", "Traditional Packet Filter", "Sentinel Next-Gen Firewall"),
        ("Inspection Layer", "Layer 3 & Layer 4 only", "Layer 3, Layer 4 & Heuristic Signatures"),
        ("Connection State Awareness", "Stateless (inspects packets in isolation)", "Stateful (tracks connection state & velocity)"),
        ("Intrusion Detection (IDS)", "None (requires separate hardware/daemon)", "Built-in real-time anomaly detection engine"),
        ("Threat Simulation", "None (requires external tools like hping3)", "Integrated Live Adversary Simulation Console"),
        ("Visual Topology Modeling", "Static CLI or textual iptables lists", "Interactive Draggable Topology Mesh (Bézier curves)"),
        ("Database Accounting", "Flat text log files (/var/log/messages)", "Relational MySQL database with persistent hit counters"),
        ("Forensic Intelligence", "Manual log parsing & grepping", "Integrated Sentinel AI Analyst (Gemini / DeepSeek)")
    ]
    t1 = doc.add_table(rows=len(t1_data), cols=3)
    for r_idx, row_values in enumerate(t1_data):
        for c_idx, val in enumerate(row_values):
            t1.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    style_academic_table(t1, [Inches(1.8), Inches(2.2), Inches(2.5)], header_bg="E2E8F0")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 3: SYSTEM ARCHITECTURE & DATA PIPELINES
    # -------------------------------------------------------------
    h3 = doc.add_heading("3. System Architecture & Data Pipelines", level=1)
    for r in h3.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_arch = doc.add_paragraph()
    p_arch.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_arch.paragraph_format.line_spacing = 1.2
    p_arch.paragraph_format.space_after = Pt(8)
    p_arch.add_run(
        "Sentinel is structured around a decoupled, three-tier modular architecture designed for high throughput, sub-millisecond response latency, and maximum fault isolation. The architecture cleanly separates visual telemetry, core firewall and heuristic IDS logic, and persistent backend socket services."
    )

    doc.add_heading("3.1 Architectural Overview", level=2)
    # Actual System Architecture Diagram image!
    arch_img_path = os.path.join(rep_dir, "system_architecture.png")
    add_image_or_placeholder(
        doc,
        arch_img_path,
        "System Architecture Diagram",
        "System architecture diagram showing Ingress Sockets -> Queue -> Policy Matcher -> IDS -> UI -> MySQL.",
        "Fig 1 : System Architecture of Sentinel Next-Gen Firewall & IDS Platform",
        width_in=6.2
    )

    doc.add_heading("3.2 Core Functional Modules", level=2)
    t3_data = [
        ("Module", "Input", "Processing Logic", "Output"),
        ("Live Traffic Terminal", "Packet stream (Live / Sim)", "Rule matching, timestamp formatting, action coloring", "Continuous monospace packet log feed"),
        ("Netfilter Policy Engine", "Source IP, Port, Protocol", "Hierarchical rule matching (Specific > Wildcard)", "ALLOW or DROP verdict + Rule ID mapping"),
        ("Heuristic IDS Engine", "Incoming packet stream", "Signature evaluation & packet velocity thresholds", "Threat Intelligence Feed alerts & banner"),
        ("Topology Mesh Graph", "Active IP nodes & LAN assets", "SVG coordinate math, drag-and-drop, dynamic Bézier curves", "Interactive draggable network topology"),
        ("Attack Simulation Console", "User-selected attack parameters", "High-velocity SYN frame injection into stream", "Spike in throughput & dropped packet counter"),
        ("IP Geo Threat Tracker", "Active IP addresses", "GeoIP coordinate projection & trajectory arcs", "Global origin radar map & geolocated list"),
        ("Sentinel AI Analyst", "Natural language forensic query", "Context injection with live packet metrics & Gemini API", "Technical incident analysis & 1-click drop rule")
    ]
    t3 = doc.add_table(rows=len(t3_data), cols=4)
    for r_idx, row_values in enumerate(t3_data):
        for c_idx, val in enumerate(row_values):
            t3.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    style_academic_table(t3, [Inches(1.5), Inches(1.5), Inches(2.0), Inches(1.5)], header_bg="E2E8F0")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 4: IMPLEMENTATION: DESIGN WEB PAGES
    # -------------------------------------------------------------
    h4 = doc.add_heading("4. Implementation: Design Web Pages & UI Modules", level=1)
    for r in h4.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_imp = doc.add_paragraph()
    p_imp.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_imp.paragraph_format.line_spacing = 1.2
    p_imp.paragraph_format.space_after = Pt(8)
    p_imp.add_run(
        "The Sentinel user interface is engineered as a high-contrast, tactical Security Operations Center (SOC) dashboard built in React 19 and styled with Tailwind CSS. The figures below document the implemented views with actual captured system screenshots and reference placeholders."
    )

    doc.add_heading("4.1 Administrator Authentication & Command Center", level=2)
    add_image_or_placeholder(
        doc,
        os.path.join(rep_dir, "fig2_login.png"),
        "Administrator Authentication Screen",
        "Administrator login screen with ID 'Ammar' and passphrase authentication.",
        "Fig 2 : Administrator Authentication & Security Access Portal",
        width_in=4.2
    )

    doc.add_heading("4.2 Live Traffic Terminal with Continuous Sequential Stream", level=2)
    add_image_or_placeholder(
        doc,
        os.path.join(rep_dir, "fig3_terminal.png"),
        "Live Traffic Terminal Feed",
        "Real-time packet logs streaming one-by-one with green [ALLOW] and red [DROP] verdicts.",
        "Fig 3 : Live Traffic Terminal Streaming Real-Time Packets",
        width_in=4.6
    )

    doc.add_heading("4.3 Firewall Policy & Rule Enforcement Manager", level=2)
    add_image_or_placeholder(
        doc,
        os.path.join(rep_dir, "fig4_rules.png"),
        "Firewall Policy & Rule Manager Table",
        "Configured firewall rules synced with MySQL database with real-time hit and byte counters.",
        "Fig 4 : Firewall Policy & Rule Enforcement Manager Table",
        width_in=5.5
    )

    doc.add_heading("4.4 Global IP Geolocation Threat Radar Map", level=2)
    add_image_or_placeholder(
        doc,
        os.path.join(rep_dir, "fig5_geomap.png"),
        "IP Geolocation Threat Radar Map",
        "Geopolitical world map with trajectory arcs and geolocated ingress origin nodes.",
        "Fig 5 : Global IP Geolocation Threat Radar Map & Origins Inventory",
        width_in=5.8
    )

    doc.add_heading("4.5 Network Topology Mesh Graph (Interactive Draggable Nodes)", level=2)
    add_image_or_placeholder(
        doc,
        os.path.join(rep_dir, "fig_topology.png"), # placeholder if not yet provided
        "Network Topology Mesh Graph",
        "Shows the Central Sentinel Core hub, connected attacker nodes (red dashed curves), allowed transit nodes (green curves), and internal LAN servers (Database, Web Server, Gateway).",
        "Fig 6 : Interactive Network Topology Mesh Graph with Draggable Nodes"
    )

    doc.add_heading("4.6 Live Attack Simulation Console & Critical Banner", level=2)
    add_image_or_placeholder(
        doc,
        os.path.join(rep_dir, "fig_attack.png"),
        "Attack Simulation Console & Threat Banner",
        "Attack simulation modal executing a TCP SYN Flood DDoS from 192.168.1.105 with top red Critical Alert Banner.",
        "Fig 7 : Live Attack Simulation Console & Critical Threat Banner"
    )

    doc.add_heading("4.7 Sentinel AI Analyst & Forensic Chatbot", level=2)
    add_image_or_placeholder(
        doc,
        os.path.join(rep_dir, "fig_ai.png"),
        "Sentinel AI Analyst Forensic Copilot",
        "Interactive forensic chat drawer with root-cause explanations and 1-click 'Commit DROP Rule' buttons.",
        "Fig 8 : Sentinel AI Analyst Interactive Forensic Chatbot"
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 5: ALGORITHMS & WORKING MECHANISM
    # -------------------------------------------------------------
    h5 = doc.add_heading("5. Algorithms & Working Mechanism", level=1)
    for r in h5.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    doc.add_heading("5.1 Priority-Based Netfilter Rule Matching Algorithm", level=2)
    p_netfilter = doc.add_paragraph()
    p_netfilter.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_netfilter.paragraph_format.line_spacing = 1.2
    p_netfilter.paragraph_format.space_after = Pt(8)
    p_netfilter.add_run(
        "To prevent ambiguity when multiple rules match a single packet, Sentinel sorts all active rules according to specificity prior to evaluation:\n"
        "1. Rules with explicit IP addresses (e.g. 192.168.1.105) take precedence over wildcard rules ('0.0.0.0/0' or 'ALL').\n"
        "2. Rules with specific destination ports (e.g. port 443) take precedence over wildcard ports ('ALL').\n"
        "3. The packet's protocol header is validated against the rule's protocol constraint.\n"
        "4. The first rule satisfying all three conditions determines the packet's fate (ALLOW or DROP). If no rule matches, the default policy (ALLOW) is applied."
    )

    doc.add_heading("5.2 Dynamic Cubic Bézier Curves for Topology Graph Edges", level=2)
    p_bezier = doc.add_paragraph()
    p_bezier.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_bezier.paragraph_format.line_spacing = 1.2
    p_bezier.paragraph_format.space_after = Pt(8)
    p_bezier.add_run(
        "To connect nodes with organic, non-linear edges that adjust dynamically when nodes are dragged, Sentinel computes cubic Bézier curves. Given a start node position P0 = (x0, y0) and an end node position P3 = (x3, y3), two intermediate control points P1 and P2 are calculated as:\n\n"
        "P1 = (x0 + (x3 - x0) / 2, y0)\n"
        "P2 = (x0 + (x3 - x0) / 2, y3)\n\n"
        "The parametric path B(t) for t in [0, 1] is defined as:\n"
        "B(t) = (1 - t)³ P0 + 3(1 - t)² t P1 + 3(1 - t) t² P2 + t³ P3\n\n"
        "This guarantees horizontal entry and exit tangents, creating clean S-curves across the network canvas regardless of node positioning."
    )

    doc.add_heading("5.3 Core Pseudocode", level=2)
    code_block = (
        "// 1. Netfilter Policy Evaluation Pseudocode\n"
        "function evaluatePacket(packet, activeRules):\n"
        "    sortedRules = sortRulesBySpecificity(activeRules)\n"
        "    for rule in sortedRules:\n"
        "        ipMatch = (rule.ip == '0.0.0.0/0' or rule.ip == packet.srcIp)\n"
        "        portMatch = (rule.port == 'ALL' or rule.port == packet.dstPort)\n"
        "        protoMatch = (rule.proto == 'ALL' or rule.proto == packet.proto)\n"
        "        if ipMatch and portMatch and protoMatch:\n"
        "            return { action: rule.action, ruleId: rule.id }\n"
        "    return { action: 'ALLOW', ruleId: 'DEFAULT' }\n\n"
        "// 2. Heuristic Intrusion Detection Pseudocode\n"
        "function inspectThreatHeuristics(packet):\n"
        "    if packet.proto == 'TCP [SYN]' and packet.dstPort == 443:\n"
        "        return createAlert('TCP SYN Flood (DDoS)', 'ET-DOS-SYNFLOOD', 'CRITICAL')\n"
        "    if packet.dstPort in [22, 3389] and packet.rate > THRESHOLD:\n"
        "        return createAlert('Credential Brute-Force', 'ET-AUTH-PROBE', 'HIGH')"
    )
    p_code = doc.add_paragraph()
    p_code.paragraph_format.space_before = Pt(4)
    p_code.paragraph_format.space_after = Pt(12)
    r_code = p_code.add_run(code_block)
    r_code.font.name = 'Consolas'
    r_code.font.size = Pt(8.5)
    r_code.font.color.rgb = RGBColor(0, 0, 0)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 6: TECHNOLOGY STACK & DEPLOYMENT ARCHITECTURE
    # -------------------------------------------------------------
    h6 = doc.add_heading("6. Technology Stack & Deployment Architecture", level=1)
    for r in h6.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_tech = doc.add_paragraph()
    p_tech.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_tech.paragraph_format.line_spacing = 1.2
    p_tech.paragraph_format.space_after = Pt(8)
    p_tech.add_run(
        "Sentinel is built with production-grade web technologies, modern JavaScript frameworks, and relational database systems to ensure high responsiveness, minimal resource footprint, and rapid development iteration."
    )

    t5_data = [
        ("Layer / Component", "Technology", "Role & Responsibility"),
        ("Frontend Framework", "React 19 (Hooks, Context, Memo)", "Modular component architecture, virtual DOM updates"),
        ("Build Tooling", "Vite 8.3", "Ultra-fast Hot Module Replacement (HMR) and bundling"),
        ("UI Styling", "Tailwind CSS 4.3", "Utility-first tactical cyber aesthetics and theme sync"),
        ("Iconography", "Lucide React", "Lightweight vector icons (Shield, Globe, Bot, Flame)"),
        ("Backend Runtime", "Node.js 22 (LTS)", "Asynchronous socket processing and REST API server"),
        ("Backend Web Server", "Express 5.3", "Routing, CORS management, and SSE streaming endpoints"),
        ("Database Engine", "MySQL 8.0 (mysql2 driver)", "Relational persistence of firewall rules and audit logs"),
        ("AI / LLM Integration", "Google Gemini / DeepSeek API", "Forensic threat reasoning and root-cause analysis"),
        ("Streaming Protocol", "Server-Sent Events (SSE)", "Real-time unidirectional push of sniffed host packets")
    ]
    t5 = doc.add_table(rows=len(t5_data), cols=3)
    for r_idx, row_values in enumerate(t5_data):
        for c_idx, val in enumerate(row_values):
            t5.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    style_academic_table(t5, [Inches(1.8), Inches(2.2), Inches(2.5)], header_bg="E2E8F0")

    doc.add_heading("6.1 Deployment & Runtime Architecture", level=2)
    p_dep = doc.add_paragraph()
    p_dep.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_dep.paragraph_format.line_spacing = 1.2
    p_dep.paragraph_format.space_after = Pt(8)
    p_dep.add_run(
        "The system runs concurrently across two local server instances:\n"
        "• Frontend Service: Vite development server hosting the React client at http://localhost:5174/\n"
        "• Backend API & SSE Bridge: Node.js/Express server listening on http://localhost:5000/\n"
        "• Database Service: MySQL instance running on localhost port 3306 managing 'firewall_db'."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 7: RESULTS, VERIFICATION & TESTING
    # -------------------------------------------------------------
    h7 = doc.add_heading("7. Results, Verification & Testing", level=1)
    for r in h7.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_res = doc.add_paragraph()
    p_res.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_res.paragraph_format.line_spacing = 1.2
    p_res.paragraph_format.space_after = Pt(8)
    p_res.add_run(
        "The Sentinel Firewall & Intrusion Detection System was comprehensively tested across synthetic attack simulations, live OS network socket sniffing, and database persistence operations. All components functioned deterministically as designed."
    )

    doc.add_heading("7.1 Attack Vector Simulation & Live Detection", level=2)
    p_att_test = doc.add_paragraph()
    p_att_test.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_att_test.paragraph_format.line_spacing = 1.2
    p_att_test.paragraph_format.space_after = Pt(8)
    p_att_test.add_run(
        "When the TCP SYN Flood scenario was triggered against port 443 from attacker IP 192.168.1.105, packet frequency accelerated from 1.2s to 350ms, the heuristic IDS detected the anomaly with 99% confidence, the top Critical Alert Banner triggered, and committing a DROP rule immediately blocked subsequent malicious frames."
    )

    doc.add_heading("Table 7 : Verification Test Cases & Empirical Results", level=3)
    t7_data = [
        ("TC #", "Test Scenario", "Input Conditions", "Expected Output", "Status"),
        ("TC-01", "Administrator Authentication", "Username: Ammar, Pass: hackAMR", "Access granted, dashboard loads", "PASS"),
        ("TC-02", "Invalid Auth Rejection", "Username: Admin, Pass: 123456", "Alert error, access denied", "PASS"),
        ("TC-03", "Continuous Live Terminal Stream", "Normal baseline mode", "Packets stream 1-by-1 at ~1.2s", "PASS"),
        ("TC-04", "SYN Flood Attack Simulation", "Launch attack via console", "Packets accelerate, alert banner triggers", "PASS"),
        ("TC-05", "Firewall DROP Enforcement", "Add rule: 192.168.1.105 -> DROP", "Packets marked [DROP], hits counter increments", "PASS"),
        ("TC-06", "Topology Mesh Node Dragging", "Pointer drag on Attacker node", "Node moves, Bézier curves follow smoothly", "PASS"),
        ("TC-07", "Topology Layout Reset", "Click 'Reset Layout' button", "Nodes snap back to balanced default layout", "PASS"),
        ("TC-08", "MySQL Rule Persistence", "Create rule -> Reload browser", "Rule reloads intact with hit counters", "PASS"),
        ("TC-09", "IP Geo Radar Projection", "Track packets from Mumbai/Frankfurt", "Country pills [IN]/[DE] render clearly", "PASS"),
        ("TC-10", "AI Analyst Forensic Query", "Query: 'Why was 192.168.1.105 flagged?'", "Structured root-cause explanation returned", "PASS")
    ]
    t7 = doc.add_table(rows=len(t7_data), cols=5)
    for r_idx, row_values in enumerate(t7_data):
        for c_idx, val in enumerate(row_values):
            t7.rows[r_idx].cells[c_idx].paragraphs[0].text = val
    style_academic_table(t7, [Inches(0.6), Inches(1.8), Inches(1.6), Inches(1.9), Inches(0.6)], header_bg="E2E8F0")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 8: CONCLUSION & FUTURE SCOPE
    # -------------------------------------------------------------
    h8 = doc.add_heading("8. Conclusion & Future Scope", level=1)
    for r in h8.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_concl = doc.add_paragraph()
    p_concl.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_concl.paragraph_format.line_spacing = 1.2
    p_concl.paragraph_format.space_after = Pt(8)
    p_concl.add_run(
        "The Sentinel: Next-Generation Firewall & Intrusion Detection System project successfully integrates theoretical network defense principles, heuristic anomaly inspection, real operating system socket sniffing, and interactive graphical topology modeling into an immersive, production-grade SecOps application.\n\n"
        "By moving beyond traditional CLI-based packet filter tutorials, Sentinel provides an intuitive, hands-on environment where security students and practitioners can observe live packet flows, test rule precedences, trigger controlled DDoS simulations, and interact with an AI-driven forensic copilot. The successful implementation of the draggable network topology graph demonstrates how visual mathematics (cubic Bézier curves) can render complex network architectures transparent and engaging. Furthermore, persisting firewall policies and live hit metrics in a relational MySQL database ensures that the platform delivers authentic production realism. This project has significantly reinforced our understanding of the CIA triad (Confidentiality, Integrity, and Availability) and network defense engineering as taught under the Minor Degree in Cyber Security curriculum."
    )

    doc.add_heading("Future Scope", level=2)
    future_items = [
        ("Kernel-Level eBPF Probing: ", "Transition packet interception from user-space socket sampling to Linux extended Berkeley Packet Filters (eBPF) for sub-microsecond in-kernel packet dropping."),
        ("Deep Learning Anomaly Classifiers: ", "Integrate lightweight LSTM or Autoencoder neural network models directly into the backend bridge to detect zero-day polymorphic traffic patterns."),
        ("Distributed Multi-Node Cluster Mesh: ", "Expand the topology engine to manage distributed firewall clusters across multiple geographic cloud VPCs through a synchronized Raft consensus protocol."),
        ("Hardware Security Key Enforcement: ", "Integrate physical FIDO2 / WebAuthn hardware security keys (e.g. YubiKey) for multi-factor cryptographic administrator authentication.")
    ]
    for title, desc in future_items:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.paragraph_format.space_after = Pt(4)
        r_t = p_item.add_run(title)
        r_t.font.bold = True
        r_t.font.color.rgb = RGBColor(0, 0, 0)
        p_item.add_run(desc)

    # -------------------------------------------------------------
    # CHAPTER 9: REFERENCES & PROJECT REPOSITORIES
    # -------------------------------------------------------------
    h9 = doc.add_heading("9. References & Project Repositories", level=1)
    for r in h9.runs:
        r.font.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0, 0, 0)

    references = [
        "NIST Special Publication 800-41 Rev. 1, 'Guidelines on Firewalls and Firewall Policy,' National Institute of Standards and Technology, 2020.",
        "J. Postel, 'Transmission Control Protocol (TCP),' RFC 793, Internet Engineering Task Force (IETF), 1981. https://datatracker.ietf.org/doc/html/rfc793",
        "W. Eddy, 'TCP SYN Flooding Attacks and Common Mitigations,' RFC 4987, IETF, 2007. https://datatracker.ietf.org/doc/html/rfc4987",
        "MITRE Corporation, 'Direct Network Flood (T1498.001),' MITRE ATT&CK Framework, 2024. https://attack.mitre.org/techniques/T1498/001/",
        "William Stallings, 'Cryptography and Network Security: Principles and Practice,' 8th Edition, Pearson Education.",
        "React Official Documentation, 'React 19 Hooks and Architecture,' Meta Open Source, 2024. https://react.dev/",
        "Express.js Foundation, 'Express 5.0 Routing and Server-Sent Events Guide,' OpenJS Foundation. https://expressjs.com/",
        "MySQL Documentation, 'MySQL 8.0 Reference Manual: InnoDB Engine and Transactions,' Oracle Corporation."
    ]

    for ref in references:
        p_ref = doc.add_paragraph(style='List Bullet')
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.15
        p_ref.add_run(ref)

    p_links = doc.add_paragraph()
    p_links.paragraph_format.space_before = Pt(14)
    r_l1 = p_links.add_run("Project GitHub Repository: ")
    r_l1.font.bold = True
    p_links.add_run("https://github.com/ammarcraft/sentinel-firewall\n")
    
    r_l2 = p_links.add_run("Local Development Environment: ")
    r_l2.font.bold = True
    p_links.add_run("http://localhost:5174/ (Frontend) | http://localhost:5000/ (Backend API)")

    doc.save(output_path)
    print(f"Successfully generated clean Academic DOCX at: {output_path}")

# -------------------------------------------------------------
# Clean Academic PDF Generation (ReportLab)
# -------------------------------------------------------------
class AcademicPageNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        # Clean academic page numbering at bottom center, NO BLUE LINE
        if self._pageNumber > 1: # Don't draw on cover page
            self.saveState()
            self.setFont("Helvetica", 9)
            self.setFillColor(colors.HexColor("#000000"))
            self.drawCentredString(A4[0] / 2.0, 36, f"{self._pageNumber}")
            self.restoreState()

def build_academic_pdf(pdf_path, rep_dir):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # 100% Pure Black and Neutral Academic Styles
    inst_style = ParagraphStyle(
        'CoverInst',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor("#000000")
    )
    sub_style = ParagraphStyle(
        'CoverSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        alignment=1,
        textColor=colors.HexColor("#334155")
    )
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        alignment=1,
        textColor=colors.HexColor("#000000")
    )
    h1_style = ParagraphStyle(
        'ReportH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#000000"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'ReportH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#000000"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor("#000000"),
        alignment=4, # Justified
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'ReportBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#000000"),
        leftIndent=15,
        spaceAfter=3
    )

    story = []

    # 1. COVER PAGE
    logo_path = os.path.join(rep_dir, "college_logo.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=2.4*inch, height=1.0*inch))
        story.append(Spacer(1, 10))

    story.append(Paragraph("G H RAISONI COLLEGE OF ENGINEERING & MANAGEMENT,<br/>WAGHOLI, PUNE", inst_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("(An Empowered Autonomous Institute, Affiliated to Savitribai Phule Pune University, Approved by AICTE, New Delhi and Recognized by Govt. of Maharashtra, NAAC ACCREDITED A+ Grade)", sub_style))
    story.append(Spacer(1, 16))
    story.append(Paragraph("<b>Minor Degree in Cyber Security</b><br/><b>TAE-2</b><br/><b>Subject: Fundamental of Cyber Security & Cryptography</b>", ParagraphStyle('CoverMinor', parent=sub_style, fontSize=10.5, leading=14, fontName='Helvetica-Bold', textColor=colors.HexColor("#000000"))))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Mini Project Report On<br/><font color='#000000' size=14><b>“Sentinel: Next-Generation Firewall & Intrusion Detection System”</b></font>", title_style))
    story.append(Spacer(1, 22))
    story.append(Paragraph("<b>Guided By:-</b><br/><font size=11 color='#000000'><b>Prof. Birudev Yele</b></font>", ParagraphStyle('CoverGuide', parent=sub_style, fontSize=10, leading=14)))
    story.append(Spacer(1, 16))
    story.append(Paragraph("<b>Submitted by:</b><br/><font size=12 color='#000000'><b>AMMAR RAISAHMAD MULLA</b></font>", ParagraphStyle('CoverSubm', parent=sub_style, fontSize=10, leading=14)))
    story.append(Spacer(1, 28))
    story.append(Paragraph("<b>Academic Year 2026-27<br/>Semester-V</b>", ParagraphStyle('CoverYear', parent=sub_style, fontSize=10, leading=14, fontName='Helvetica-Bold')))
    
    story.append(PageBreak())

    # 2. CERTIFICATE PAGE
    story.append(Paragraph("CERTIFICATE", ParagraphStyle('CertHead', parent=h1_style, alignment=1, fontSize=15, leading=18)))
    story.append(Spacer(1, 20))
    cert_text = (
        "This is to certify that the mini project entitled <b>“Sentinel: Next-Generation Firewall & Intrusion Detection System”</b> "
        "embodies the original work done by <b>AMMAR RAISAHMAD MULLA</b> as a partial fulfilment of the requirement of TAE-2 for "
        "the subject <b>Fundamental of Cyber Security & Cryptography</b> under the Minor Degree in Cyber Security, Third Year B. Tech., "
        "Semester V, during the academic year 2026-2027."
    )
    story.append(Paragraph(cert_text, ParagraphStyle('CertBody', parent=body_style, fontSize=10, leading=15)))
    story.append(Spacer(1, 40))
    story.append(Paragraph("<b>Date:</b> 01/10/2026<br/><b>Place:</b> Pune", ParagraphStyle('CertDate', parent=body_style, fontSize=9.5, leading=14)))
    story.append(Spacer(1, 80))

    sig_data = [[
        Paragraph("<b>Prof. Birudev Yele</b><br/><font size=8 color='#475569'>Project Guide</font>", ParagraphStyle('Sig1', parent=body_style)),
        Paragraph("<b>Mrs. Sarita Patil</b><br/><font size=8 color='#475569'>Head of Department</font>", ParagraphStyle('Sig2', parent=body_style, alignment=2))
    ]]
    sig_tbl = Table(sig_data, colWidths=[2.8*inch, 2.8*inch])
    sig_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(sig_tbl)

    story.append(PageBreak())

    # 3. ACKNOWLEDGEMENT PAGE
    story.append(Paragraph("ACKNOWLEDGEMENT", ParagraphStyle('AckHead', parent=h1_style, alignment=1, fontSize=15, leading=18)))
    story.append(Spacer(1, 16))
    ack_p1 = (
        "I would like to express my sincere gratitude to <b>Prof. Birudev Yele</b>, my project guide, for his valuable guidance, "
        "encouragement, and constant technical support throughout the development of this mini project on the "
        "<b>Sentinel: Next-Generation Firewall & Intrusion Detection System</b>. His insights into network defense paradigms, "
        "packet filtering rulesets, and heuristic intrusion detection helped shape both the implementation and this report."
    )
    ack_p2 = (
        "I am deeply thankful to <b>Mrs. Sarita Patil</b>, Head of the Department of Computer Engineering, for providing the "
        "necessary computing laboratories and an encouraging academic environment. I also thank all the staff members of the "
        "Department of Computer Engineering for their assistance whenever required."
    )
    ack_p3 = (
        "Finally, I extend my heartfelt appreciation to my family and friends, and to everyone who supported me directly or "
        "indirectly in the completion of this project."
    )
    story.append(Paragraph(ack_p1, body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ack_p2, body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ack_p3, body_style))
    story.append(Spacer(1, 24))
    story.append(Paragraph("<b>AMMAR RAISAHMAD MULLA</b><br/>Third Year B. Tech. (Cyber Security Minor)<br/>Department of Computer Engineering", ParagraphStyle('AckSign', parent=body_style, alignment=2, leading=13)))

    story.append(PageBreak())

    # 4. INDEX TABLE
    story.append(Paragraph("INDEX", ParagraphStyle('IdxHead', parent=h1_style, alignment=1, fontSize=15, leading=18)))
    story.append(Spacer(1, 12))
    idx_rows = [
        ["Sr. No", "Title", "Page No"],
        ["1.", "Problem Definition & Objectives", "1"],
        ["2.", "Introduction & Theoretical Background", "2"],
        ["3.", "System Architecture & Data Pipelines", "5"],
        ["4.", "Implementation: Design Web Pages & UI Modules", "7"],
        ["5.", "Algorithms & Working Mechanism", "11"],
        ["6.", "Technology Stack & Deployment Architecture", "13"],
        ["7.", "Results, Verification & Testing", "15"],
        ["8.", "Conclusion & Future Scope", "18"],
        ["9.", "References & Project Repositories", "19"]
    ]
    idx_table_data = []
    for r_i, row in enumerate(idx_rows):
        row_para = []
        for c_i, text in enumerate(row):
            align = 1 if c_i != 1 else 0
            f_bold = "<b>" if r_i == 0 else ""
            f_end = "</b>" if r_i == 0 else ""
            p_st = ParagraphStyle(f'IdxP_{r_i}_{c_i}', parent=body_style, alignment=align, fontSize=8.5, textColor=colors.HexColor("#000000"))
            row_para.append(Paragraph(f"{f_bold}{text}{f_end}", p_st))
        idx_table_data.append(row_para)

    idx_tbl = Table(idx_table_data, colWidths=[0.8*inch, 4.4*inch, 0.8*inch])
    idx_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(KeepTogether(idx_tbl))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # 5. CHAPTER 1: PROBLEM DEFINITION & OBJECTIVES
    # -------------------------------------------------------------
    story.append(Paragraph("1. Problem Definition & Objectives", h1_style))
    story.append(Paragraph("Problem Definition", h2_style))
    story.append(Paragraph(
        "Modern enterprise computing infrastructure and cloud networks are subjected to persistent, automated cyber-attacks. "
        "These range from volumetric Distributed Denial of Service (DDoS) vectors—such as TCP SYN floods designed to saturate server "
        "transmission control block (TCB) memory queues—to automated horizontal and vertical port scanning recon probes seeking vulnerabilities "
        "across critical administrative daemons (SSH port 22, RDP port 3389, and SMB port 445). Traditional enterprise firewall utilities, "
        "including Linux iptables, operate as opaque black boxes providing static text logs that lack real-time interactive telemetry and visual threat trajectory mapping.",
        body_style
    ))
    story.append(Paragraph("Objectives", h2_style))
    objectives_pdf = [
        "<b>Layer 4 Stateful Packet Inspection:</b> To develop a firewall engine evaluating incoming packets against configured rules (IP, port, protocol) with real-time ALLOW/DROP verdicts.",
        "<b>Heuristic Intrusion Detection (IDS):</b> To implement an anomaly engine that flags malicious vectors like TCP SYN Floods (MITRE ATT&CK T1498.001) and port scans.",
        "<b>Interactive Draggable Topology Mesh:</b> To engineer a dynamic topology graph using SVG math and cubic Bézier curves, providing visual representation of threats and internal LAN assets.",
        "<b>Adversary Attack Simulation Console:</b> To create a simulation console enabling security teams to trigger live attack scenarios on demand to validate packet dropping.",
        "<b>Dual Operational Modes:</b> To support both 'Live Network Mode' (sniffing host TCP sockets via Server-Sent Events) and 'Simulation Mode'.",
        "<b>SecOps AI Forensic Analyst:</b> To integrate an intelligent assistant capable of root-cause analysis on flagged attacker IPs with 1-click drop rules.",
        "<b>Relational Database Persistence:</b> To store firewall rules and logs in MySQL ('firewall_db') with persistent hit and byte counters."
    ]
    for obj in objectives_pdf:
        story.append(Paragraph(f"• {obj}", bullet_style))

    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 6. CHAPTER 2: THEORETICAL BACKGROUND
    # -------------------------------------------------------------
    story.append(Paragraph("2. Introduction & Theoretical Background", h1_style))
    story.append(Paragraph(
        "The Sentinel Firewall & Intrusion Detection System is an advanced SecOps platform designed to combine stateful packet filtering, "
        "heuristic threat signature matching, live socket streaming, and interactive topology modeling. This chapter covers the theoretical "
        "principles underpinning next-generation firewall architectures.",
        body_style
    ))
    story.append(Paragraph("2.1 Next-Generation Firewalls (NGFW) vs Traditional Packet Filters", h2_style))
    story.append(Paragraph(
        "Traditional packet filters operate statelessly at Layers 3 and 4, inspecting IP headers in isolation. Next-Generation Firewalls (NGFWs) "
        "integrate stateful inspection, connection state tracking (SYN, SYN-ACK, ESTABLISHED), and application awareness. Sentinel combines stateful "
        "policy evaluation with heuristic anomaly detection.",
        body_style
    ))
    story.append(Paragraph("2.2 Common Network Attack Vectors", h2_style))
    story.append(Paragraph(
        "• <b>TCP SYN Flood DDoS (MITRE T1498.001):</b> Exploits the three-way handshake by transmitting rapid SYN frames without completing handshakes, overflowing kernel connection tables.<br/>"
        "• <b>Port Reconnaissance (MITRE T1046):</b> Scanning common ports (22, 80, 443, 445, 3389) to enumerate vulnerable services.<br/>"
        "• <b>Credential Brute-Force:</b> Repeated connection bursts against remote access daemons (SSH/RDP).",
        body_style
    ))

    # Page Break before Table 1 so it NEVER splits across pages!
    story.append(PageBreak())

    # Comparison Table (Wrapped in KeepTogether so it never breaks across pages)
    t1_p_data = [
        [Paragraph("<b>Parameter</b>", ParagraphStyle('TH1', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Traditional Packet Filter</b>", ParagraphStyle('TH2', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Sentinel Next-Gen Firewall</b>", ParagraphStyle('TH3', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold'))],
        [Paragraph("Inspection Layer", body_style), Paragraph("Layer 3 & 4 only", body_style), Paragraph("Layer 3, 4 & Heuristic Signatures", body_style)],
        [Paragraph("Connection State", body_style), Paragraph("Stateless", body_style), Paragraph("Stateful + Velocity Tracking", body_style)],
        [Paragraph("Intrusion Detection", body_style), Paragraph("None (separate daemon)", body_style), Paragraph("Built-in Heuristic IDS Engine", body_style)],
        [Paragraph("Attack Simulation", body_style), Paragraph("Requires external tools", body_style), Paragraph("Integrated Live Simulation Console", body_style)],
        [Paragraph("Topology Modeling", body_style), Paragraph("Textual CLI iptables", body_style), Paragraph("Interactive Draggable Mesh (Bézier curves)", body_style)],
        [Paragraph("Database Sync", body_style), Paragraph("Flat text files", body_style), Paragraph("Relational MySQL database", body_style)],
        [Paragraph("AI Forensics", body_style), Paragraph("None", body_style), Paragraph("Sentinel AI Analyst (Gemini / DeepSeek)", body_style)]
    ]
    t1_pdf = Table(t1_p_data, colWidths=[1.8*inch, 2.1*inch, 2.5*inch])
    t1_pdf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(Paragraph("<b>Table 1 : Traditional Firewalls vs Sentinel Next-Gen Firewall</b>", ParagraphStyle('TCap1', parent=body_style, fontName='Helvetica-Bold', fontSize=8.5)))
    story.append(Spacer(1, 4))
    story.append(KeepTogether(t1_pdf))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # 7. CHAPTER 3: SYSTEM ARCHITECTURE
    # -------------------------------------------------------------
    story.append(Paragraph("3. System Architecture & Data Pipelines", h1_style))
    story.append(Paragraph(
        "Sentinel follows a decoupled three-tier architecture ensuring sub-millisecond evaluation latency, browser rendering stability, "
        "and persistent database state across sessions.",
        body_style
    ))
    story.append(Paragraph("3.1 Architectural Overview", h2_style))
    
    # Embed System Architecture Diagram in PDF!
    arch_img_path = os.path.join(rep_dir, "system_architecture.png")
    if os.path.exists(arch_img_path):
        story.append(RLImage(arch_img_path, width=6.2*inch, height=2.9*inch))
        story.append(Spacer(1, 4))
        story.append(Paragraph("<b>Fig 1 : System Architecture of Sentinel Next-Gen Firewall & IDS Platform</b>", ParagraphStyle('FigCap1', parent=body_style, alignment=1, fontName='Helvetica-Bold', fontSize=8.5)))
        story.append(Spacer(1, 8))

    story.append(Paragraph("3.2 Core Functional Modules", h2_style))
    t3_p_data = [
        [Paragraph("<b>Module</b>", ParagraphStyle('M0', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Input</b>", ParagraphStyle('M1', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Processing Logic</b>", ParagraphStyle('M2', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Output</b>", ParagraphStyle('M3', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold'))],
        [Paragraph("Live Terminal", body_style), Paragraph("Packet stream", body_style), Paragraph("Rule matching & formatting", body_style), Paragraph("Monospace log stream", body_style)],
        [Paragraph("Netfilter Engine", body_style), Paragraph("IP, Port, Protocol", body_style), Paragraph("Hierarchical rule evaluation", body_style), Paragraph("ALLOW/DROP verdict", body_style)],
        [Paragraph("Heuristic IDS", body_style), Paragraph("Live packets", body_style), Paragraph("Velocity & signature inspection", body_style), Paragraph("Threat feed & alerts", body_style)],
        [Paragraph("Topology Mesh", body_style), Paragraph("Origin & LAN nodes", body_style), Paragraph("Pointer dragging & Bézier curves", body_style), Paragraph("Interactive network mesh", body_style)],
        [Paragraph("Attack Console", body_style), Paragraph("Attack vector config", body_style), Paragraph("High-rate SYN packet flood", body_style), Paragraph("DDoS load & spike", body_style)],
        [Paragraph("AI Analyst", body_style), Paragraph("Forensic queries", body_style), Paragraph("Live telemetry + Gemini API", body_style), Paragraph("Root-cause analysis", body_style)]
    ]
    t3_pdf = Table(t3_p_data, colWidths=[1.3*inch, 1.2*inch, 2.2*inch, 1.7*inch])
    t3_pdf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(Paragraph("<b>Table 3 : Core System Modules</b>", ParagraphStyle('TCap3', parent=body_style, fontName='Helvetica-Bold', fontSize=8.5)))
    story.append(Spacer(1, 4))
    story.append(KeepTogether(t3_pdf))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # 8. CHAPTER 4: IMPLEMENTATION (DESIGN WEB PAGES)
    # -------------------------------------------------------------
    story.append(Paragraph("4. Implementation: Design Web Pages & UI Modules", h1_style))
    story.append(Paragraph(
        "The user interface is engineered as a tactical Security Operations Center (SOC) dashboard. "
        "The figures below document the implemented views with actual captured system screenshots and reference placeholders.",
        body_style
    ))

    def add_pdf_screenshot_block(img_name, title, desc, caption, width=5.5*inch, height=2.8*inch):
        img_p = os.path.join(rep_dir, img_name)
        if os.path.exists(img_p):
            return KeepTogether([
                RLImage(img_p, width=width, height=height),
                Spacer(1, 3),
                Paragraph(f"<b>{caption}</b>", ParagraphStyle('CapP', parent=body_style, alignment=1, fontName='Helvetica-Bold', fontSize=8.5)),
                Spacer(1, 10)
            ])
        else:
            data = [[
                Paragraph(f"<b>📷 [SCREENSHOT PLACEHOLDER: {title}]</b><br/><font size=7.5 color='#475569'><i>{desc}</i></font>", ParagraphStyle('BoxP', parent=body_style, fontSize=8.5, leading=11))
            ]]
            tbl = Table(data, colWidths=[6.4*inch])
            tbl.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                ('LINELEFT', (0,0), (0,0), 3, colors.HexColor("#475569")),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ]))
            return KeepTogether([
                tbl,
                Spacer(1, 3),
                Paragraph(f"<b>{caption}</b>", ParagraphStyle('CapP2', parent=body_style, alignment=1, fontName='Helvetica-Bold', fontSize=8.5)),
                Spacer(1, 10)
            ])

    story.append(Paragraph("4.1 Administrator Authentication & Command Center", h2_style))
    story.append(add_pdf_screenshot_block("fig2_login.png", "Administrator Login Screen", "Administrator authentication portal.", "Fig 2 : Administrator Authentication & Security Access Portal", width=4.0*inch, height=2.7*inch))

    story.append(Paragraph("4.2 Live Traffic Terminal with Continuous Sequential Stream", h2_style))
    story.append(add_pdf_screenshot_block("fig3_terminal.png", "Live Traffic Terminal Feed", "Continuous one-by-one packet logs stream with [ALLOW] and [DROP] verdicts.", "Fig 3 : Live Traffic Terminal Streaming Real-Time Packets", width=4.2*inch, height=2.6*inch))

    story.append(Paragraph("4.3 Firewall Policy & Rule Enforcement Manager", h2_style))
    story.append(add_pdf_screenshot_block("fig4_rules.png", "Firewall Policy & Rule Manager Table", "Configured firewall rules synced with MySQL database with hit and byte counters.", "Fig 4 : Firewall Policy & Rule Enforcement Manager Table", width=5.6*inch, height=2.6*inch))

    story.append(Paragraph("4.4 Global IP Geolocation Threat Radar Map", h2_style))
    story.append(add_pdf_screenshot_block("fig5_geomap.png", "IP Geolocation Threat Radar Map", "Geopolitical world map with trajectory arcs and geolocated ingress origin nodes.", "Fig 5 : Global IP Geolocation Threat Radar Map & Origins Inventory", width=5.8*inch, height=2.2*inch))

    story.append(Paragraph("4.5 Network Topology Mesh Graph (Interactive Draggable Nodes)", h2_style))
    story.append(add_pdf_screenshot_block("fig_topology.png", "Network Topology Mesh Graph", "Shows the central Sentinel Core hub, connected attacker nodes (red dashed curves), allowed transit nodes (green curves), and internal LAN servers.", "Fig 6 : Interactive Network Topology Mesh Graph with Draggable Nodes"))

    story.append(Paragraph("4.6 Live Attack Simulation Console & Critical Banner", h2_style))
    story.append(add_pdf_screenshot_block("fig_attack.png", "Attack Simulation Console & Threat Banner", "Attack simulation modal executing a TCP SYN Flood DDoS from 192.168.1.105 with top red Critical Alert Banner.", "Fig 7 : Live Attack Simulation Console & Critical Threat Banner"))

    story.append(Paragraph("4.7 Sentinel AI Analyst & Forensic Chatbot", h2_style))
    story.append(add_pdf_screenshot_block("fig_ai.png", "Sentinel AI Analyst Forensic Copilot", "Interactive forensic chat drawer with root-cause explanations and 1-click 'Commit DROP Rule' buttons.", "Fig 8 : Sentinel AI Analyst Interactive Forensic Chatbot"))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # 9. CHAPTER 5: ALGORITHMS & WORKING
    # -------------------------------------------------------------
    story.append(Paragraph("5. Algorithms & Working Mechanism", h1_style))
    story.append(Paragraph("5.1 Netfilter Rule Matching Algorithm", h2_style))
    story.append(Paragraph(
        "Sentinel sorts all active policies by specificity: explicit IP matches precede wildcard '0.0.0.0/0', and specific ports precede 'ALL'. "
        "The first rule satisfying IP, port, and transport protocol constraints determines the packet verdict (ALLOW or DROP).",
        body_style
    ))
    story.append(Paragraph("5.2 Dynamic Cubic Bézier Curves for Topology Edges", h2_style))
    story.append(Paragraph(
        "For smooth, responsive edge rendering as nodes are dragged, cubic Bézier curves are computed between node coordinates P0(x0,y0) and P3(x3,y3) "
        "using intermediate control points P1(x0 + (x3-x0)/2, y0) and P2(x0 + (x3-x0)/2, y3). The equation guarantees horizontal tangents:<br/>"
        "<b>B(t) = (1-t)³ P0 + 3(1-t)² t P1 + 3(1-t) t² P2 + t³ P3</b>",
        body_style
    ))

    code_text = (
        "// Pseudocode: Netfilter Packet Evaluation & Heuristic IDS Inspection\n"
        "function evaluatePacketAgainstRules(packet, rules):\n"
        "    sortedRules = sortRulesBySpecificity(rules)\n"
        "    for r in sortedRules:\n"
        "        if match(packet.srcIp, r.ip) and match(packet.dstPort, r.port) and match(packet.proto, r.proto):\n"
        "            return { action: r.action, matchedRule: r.id }\n"
        "    return { action: 'ALLOW', matchedRule: 'DEFAULT' }\n\n"
        "function inspectThreatHeuristics(packet):\n"
        "    if packet.proto == 'TCP [SYN]' and packet.dstPort == 443:\n"
        "        return triggerAlert('TCP SYN Flood (DDoS)', 'ET-DOS-SYNFLOOD', 'CRITICAL')\n"
        "    if packet.dstPort in [22, 3389] and packet.rate > THRESHOLD:\n"
        "        return triggerAlert('Brute-Force Probe', 'ET-AUTH-PROBE', 'HIGH')"
    )
    story.append(Paragraph(f"<font face='Courier' size=7.5 color='#000000'>{code_text.replace(chr(10), '<br/>')}</font>", ParagraphStyle('CodeP', parent=body_style, backColor=colors.HexColor("#F8FAFC"), borderPadding=6)))

    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 10. CHAPTER 6: TECHNOLOGY STACK
    # -------------------------------------------------------------
    story.append(Paragraph("6. Technology Stack & Deployment Architecture", h1_style))
    t5_p_data = [
        [Paragraph("<b>Component</b>", ParagraphStyle('TP1', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Technology</b>", ParagraphStyle('TP2', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Role & Purpose</b>", ParagraphStyle('TP3', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold'))],
        [Paragraph("Frontend UI", body_style), Paragraph("React 19, Tailwind CSS 4", body_style), Paragraph("Reactive SOC dashboard and SVG topology", body_style)],
        [Paragraph("Bundler", body_style), Paragraph("Vite 8.3", body_style), Paragraph("Fast dev server and module bundling", body_style)],
        [Paragraph("Backend Server", body_style), Paragraph("Node.js 22, Express 5", body_style), Paragraph("Native socket sniffer and SSE stream", body_style)],
        [Paragraph("Database", body_style), Paragraph("MySQL 8.0 (mysql2)", body_style), Paragraph("Rule persistence and audit logging", body_style)],
        [Paragraph("AI Copilot", body_style), Paragraph("Google Gemini / DeepSeek", body_style), Paragraph("Forensic reasoning and root cause analysis", body_style)]
    ]
    t5_pdf = Table(t5_p_data, colWidths=[1.8*inch, 2.0*inch, 2.6*inch])
    t5_pdf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(Paragraph("<b>Table 5 : Technology Stack</b>", ParagraphStyle('TCap5', parent=body_style, fontName='Helvetica-Bold', fontSize=8.5)))
    story.append(Spacer(1, 4))
    story.append(KeepTogether(t5_pdf))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # 11. CHAPTER 7: RESULTS & TESTING
    # -------------------------------------------------------------
    story.append(Paragraph("7. Results, Verification & Testing", h1_style))
    story.append(Paragraph(
        "Sentinel was tested across multiple network conditions, adversary attack simulations, and database persistence operations. "
        "All test cases passed successfully as documented in Table 7.",
        body_style
    ))

    t7_p_data = [
        [Paragraph("<b>TC#</b>", ParagraphStyle('T0', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Scenario</b>", ParagraphStyle('T1', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Input</b>", ParagraphStyle('T2', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Expected Output</b>", ParagraphStyle('T3', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold')),
         Paragraph("<b>Status</b>", ParagraphStyle('T4', parent=body_style, textColor=colors.black, fontSize=8, fontName='Helvetica-Bold'))],
        [Paragraph("TC-01", body_style), Paragraph("Admin Auth", body_style), Paragraph("Ammar / hackAMR", body_style), Paragraph("Access granted", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-02", body_style), Paragraph("Invalid Login", body_style), Paragraph("Wrong password", body_style), Paragraph("Access denied", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-03", body_style), Paragraph("Terminal Stream", body_style), Paragraph("Normal baseline", body_style), Paragraph("Continuous 1-by-1 flow", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-04", body_style), Paragraph("SYN Flood Simulation", body_style), Paragraph("Trigger attack", body_style), Paragraph("Speedup + Alert Banner", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-05", body_style), Paragraph("DROP Rule Enforcement", body_style), Paragraph("Block 192.168.1.105", body_style), Paragraph("Packets marked [DROP]", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-06", body_style), Paragraph("Topology Node Drag", body_style), Paragraph("Pointer drag node", body_style), Paragraph("Smooth Bézier curves follow", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-07", body_style), Paragraph("Topology Layout Reset", body_style), Paragraph("Click Reset Layout", body_style), Paragraph("Default positions restored", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-08", body_style), Paragraph("MySQL Persistence", body_style), Paragraph("Reload page", body_style), Paragraph("Rules reload with hits", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-09", body_style), Paragraph("IP Geo Radar", body_style), Paragraph("Track Mumbai IP", body_style), Paragraph("Country badge [IN] visible", body_style), Paragraph("PASS", body_style)],
        [Paragraph("TC-10", body_style), Paragraph("AI Copilot Query", body_style), Paragraph("Forensic prompt", body_style), Paragraph("Analysis returned", body_style), Paragraph("PASS", body_style)]
    ]
    t7_pdf = Table(t7_p_data, colWidths=[0.5*inch, 1.5*inch, 1.4*inch, 2.4*inch, 0.6*inch])
    t7_pdf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(Paragraph("<b>Table 7 : Verification Test Cases & Empirical Results</b>", ParagraphStyle('TCap7', parent=body_style, fontName='Helvetica-Bold', fontSize=8.5)))
    story.append(Spacer(1, 4))
    story.append(KeepTogether(t7_pdf))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # 12. CHAPTER 8 & 9: CONCLUSION & REFERENCES
    # -------------------------------------------------------------
    story.append(Paragraph("8. Conclusion & Future Scope", h1_style))
    story.append(Paragraph(
        "The Sentinel: Next-Generation Firewall & Intrusion Detection System project successfully demonstrates how stateful packet filtering, "
        "heuristic signature anomaly detection, and interactive topology modeling can be synthesized into an educational, production-ready "
        "SecOps platform. By providing real-time visibility into packet trajectories, automated attack mitigation, and persistent database accounting, "
        "the project strengthened our understanding of confidentiality, integrity, and availability within the Minor Degree in Cyber Security curriculum.",
        body_style
    ))
    story.append(Paragraph("Future Scope", h2_style))
    story.append(Paragraph(
        "• <b>Kernel-Level eBPF Probing:</b> Transition packet interception to Linux eBPF for sub-microsecond in-kernel dropping.<br/>"
        "• <b>Deep Learning Anomaly Detection:</b> Integrate neural Autoencoder models to identify zero-day polymorphic traffic.<br/>"
        "• <b>Multi-Node Cluster Mesh:</b> Synchronize distributed firewall policies across multiple cloud VPCs via Raft consensus.",
        body_style
    ))

    story.append(Paragraph("9. References & Project Repositories", h1_style))
    refs = [
        "NIST Special Publication 800-41 Rev. 1, 'Guidelines on Firewalls and Firewall Policy,' 2020.",
        "J. Postel, 'Transmission Control Protocol (TCP),' RFC 793, IETF, 1981.",
        "W. Eddy, 'TCP SYN Flooding Attacks and Common Mitigations,' RFC 4987, IETF, 2007.",
        "MITRE Corporation, 'Direct Network Flood (T1498.001),' MITRE ATT&CK Framework, 2024.",
        "William Stallings, 'Cryptography and Network Security: Principles and Practice,' 8th Edition, Pearson."
    ]
    for r in refs:
        story.append(Paragraph(f"• {r}", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>GitHub Repository:</b> https://github.com/ammarcraft/sentinel-firewall<br/><b>Local Runtime:</b> http://localhost:5174/ (Frontend) | http://localhost:5000/ (Backend API)", body_style))

    doc.build(story, canvasmaker=AcademicPageNumberedCanvas)
    print(f"Successfully generated clean Academic PDF at: {pdf_path}")

if __name__ == '__main__':
    workspace = r"c:\Users\ammar\OneDrive\Desktop\Firewall"
    rep_dir = os.path.join(workspace, "reports")
    docx_out = os.path.join(rep_dir, "Sentinel_Firewall_Project_Report.docx")
    pdf_out = os.path.join(rep_dir, "Sentinel_Firewall_Project_Report.pdf")
    
    build_academic_docx(docx_out, rep_dir)
    build_academic_pdf(pdf_out, rep_dir)
