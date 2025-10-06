#!/usr/bin/env python3
"""
AI-Powered Shopify Section Generator
Generates highly customizable sections with intelligent option suggestions
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
import argparse

@dataclass
class SectionConfig:
    """Configuration for a section"""
    name: str
    type: str
    description: str = ""
    settings: List[Dict] = field(default_factory=list)
    blocks: List[Dict] = field(default_factory=list)
    presets: List[Dict] = field(default_factory=list)
    intelligence_config: Dict = field(default_factory=dict)

@dataclass
class GeneratedSection:
    """Generated section files"""
    liquid_content: str
    css_content: str
    js_content: str = ""

class SectionTypeAnalyzer:
    """Analyzes section types and suggests appropriate options using intelligent configuration"""

    def __init__(self, config_path: str = "section-intelligence-config.json"):
        """Initialize with intelligent configuration"""
        self.config_path = config_path
        self.intelligence_config = self._load_intelligence_config()
        self.section_types = self.intelligence_config.get('sectionTypes', {})

    def _load_intelligence_config(self) -> Dict:
        """Load the intelligent configuration file"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️  Intelligence config not found at {self.config_path}, using basic config")
            return {'sectionTypes': {}, 'intelligenceRules': {}}
        except json.JSONDecodeError:
            print(f"⚠️  Invalid intelligence config JSON, using basic config")
            return {'sectionTypes': {}, 'intelligenceRules': {}}

    def analyze_section_type(self, section_type: str) -> Dict:
        """Analyze section type and return intelligent configuration suggestions"""
        # Check if we have intelligent configuration for this section type
        if section_type in self.section_types:
            return self._get_intelligent_config(section_type)

        # Fall back to generic configuration for unknown types
        return self._get_generic_config(section_type)

    def _get_intelligent_config(self, section_type: str) -> Dict:
        """Get intelligent configuration for known section types"""
        section_config = self.section_types[section_type].copy()

        # Organize settings by priority
        organized_settings = self._organize_settings(section_config)

        # Add intelligence metadata
        section_config.update({
            'intelligent_settings': organized_settings,
            'suggested_settings': organized_settings['essential'] + organized_settings['recommended'],
            'advanced_settings': organized_settings['advanced'],
            'suggested_blocks': section_config.get('suggestedBlocks', []),
            'intelligence_score': self._calculate_intelligence_score(section_config),
            'optimization_tips': self._get_optimization_tips(section_type)
        })

        return section_config

    def _organize_settings(self, section_config: Dict) -> Dict:
        """Organize settings by priority level"""
        organized = {
            'essential': [],
            'recommended': [],
            'advanced': []
        }

        # Essential settings (required for basic functionality)
        for setting in section_config.get('essentialSettings', []):
            organized['essential'].append(self._normalize_setting(setting))

        # Recommended settings (enhance functionality)
        for setting in section_config.get('recommendedSettings', []):
            organized['recommended'].append(self._normalize_setting(setting))

        # Advanced settings (power user features)
        for setting in section_config.get('advancedSettings', []):
            organized['advanced'].append(self._normalize_setting(setting))

        return organized

    def _normalize_setting(self, setting: Dict) -> Dict:
        """Normalize setting format for consistency"""
        # Ensure all required fields are present
        normalized = {
            'type': setting.get('type', 'text'),
            'id': setting.get('id', setting.get('name', 'setting')),
            'label': setting.get('label', setting['id'].replace('_', ' ').title()),
            'default': setting.get('default', self._get_default_for_type(setting.get('type', 'text'))),
            'required': setting.get('required', False),
            'info': setting.get('info', ''),
            'category': setting.get('category', 'recommended')
        }

        # Add options for select fields
        if setting.get('type') == 'select' and 'options' in setting:
            normalized['options'] = setting['options']

        # Add range constraints
        if setting.get('type') == 'range':
            normalized.update({
                'min': setting.get('min', 0),
                'max': setting.get('max', 100),
                'unit': setting.get('unit', '')
            })

        # Add validation rules
        if 'validation' in setting:
            normalized['validation'] = setting['validation']

        return normalized

    def _get_default_for_type(self, setting_type: str) -> str:
        """Get appropriate default value for setting type"""
        defaults = {
            'text': 'Default text',
            'textarea': 'Default description',
            'color': '#000000',
            'image_picker': None,
            'url': '/',
            'checkbox': False,
            'range': 50,
            'select': ''
        }
        return defaults.get(setting_type, 'Default value')

    def _calculate_intelligence_score(self, section_config: Dict) -> int:
        """Calculate intelligence score based on configuration completeness"""
        score = 0

        # Base score for having essential settings
        if section_config.get('essentialSettings'):
            score += 30

        # Additional score for recommended settings
        if section_config.get('recommendedSettings'):
            score += 25

        # Score for advanced settings (but not too many)
        advanced_count = len(section_config.get('advancedSettings', []))
        if advanced_count > 0:
            score += min(advanced_count * 5, 20)

        # Score for blocks (dynamic content)
        if section_config.get('suggestedBlocks'):
            score += 15

        # Bonus for good use case coverage
        if section_config.get('commonUseCases'):
            score += 10

        return min(score, 100)

    def _get_optimization_tips(self, section_type: str) -> List[str]:
        """Get optimization tips for the section type"""
        tips = []

        if section_type == 'hero':
            tips.extend([
                "Use high-quality background images for better visual impact",
                "Keep heading text concise and compelling",
                "Consider adding a secondary CTA button for better conversion"
            ])
        elif section_type == 'features':
            tips.extend([
                "Use consistent icon styles across all features",
                "Limit features to 3-6 for better readability",
                "Add hover effects to increase interactivity"
            ])
        elif section_type == 'testimonials':
            tips.extend([
                "Include customer photos for authenticity",
                "Use varied testimonial lengths for visual interest",
                "Consider adding company logos for B2B credibility"
            ])
        elif section_type == 'gallery':
            tips.extend([
                "Optimize images for web to improve loading speed",
                "Use consistent aspect ratios for better grid layout",
                "Add alt text for better accessibility"
            ])

        return tips

    def _get_generic_config(self, section_type: str) -> Dict:
        """Get generic configuration for unknown section types"""
        return {
            'description': f'Custom {section_type} section',
            'essentialSettings': [
                {
                    'id': 'heading',
                    'type': 'text',
                    'label': 'Section Heading',
                    'default': f'{section_type.title()} Section'
                }
            ],
            'recommendedSettings': [
                {
                    'id': 'background_color',
                    'type': 'color',
                    'label': 'Background Color',
                    'default': '#ffffff'
                },
                {
                    'id': 'text_color',
                    'type': 'color',
                    'label': 'Text Color',
                    'default': '#000000'
                }
            ],
            'advancedSettings': [
                {
                    'id': 'animation',
                    'type': 'select',
                    'label': 'Animation Effect',
                    'options': [
                        {'value': 'none', 'label': 'None'},
                        {'value': 'fadeIn', 'label': 'Fade In'}
                    ],
                    'default': 'fadeIn'
                }
            ],
            'suggestedBlocks': [],
            'intelligent_settings': {
                'essential': [],
                'recommended': [],
                'advanced': []
            },
            'intelligence_score': 25,
            'optimization_tips': ['Consider adding more specific settings for better customization']
        }

class SectionGenerator:
    """Main section generator class"""

    def __init__(self, theme_path: str = "shopify-theme"):
        self.theme_path = Path(theme_path)
        self.analyzer = SectionTypeAnalyzer()

    def generate_section(self, section_name: str, section_type: str, description: str = "", use_advanced: bool = True) -> GeneratedSection:
        """Generate a complete section with intelligent configuration"""

        # Analyze section type and get intelligent suggestions
        analysis = self.analyzer.analyze_section_type(section_type)

        if not description:
            description = analysis.get('description', f'Custom {section_type} section')

        # Create section configuration with intelligent settings
        settings = []
        if use_advanced and 'intelligent_settings' in analysis:
            # Use intelligent settings organization
            intelligent_settings = analysis['intelligent_settings']
            settings = intelligent_settings['essential'] + intelligent_settings['recommended']
            if use_advanced:
                settings.extend(intelligent_settings['advanced'])
        else:
            # Fall back to simple settings
            settings = analysis.get('suggested_settings', [])

        config = SectionConfig(
            name=section_name,
            type=section_type,
            description=description,
            settings=settings,
            blocks=analysis.get('suggested_blocks', []),
            intelligence_config=analysis
        )

        # Generate section files with enhanced intelligence
        liquid_content = self._generate_liquid(config)
        css_content = self._generate_css(config)
        js_content = self._generate_js(config)

        return GeneratedSection(liquid_content, css_content, js_content)

    def _generate_liquid(self, config: SectionConfig) -> str:
        """Generate Liquid template content with intelligent schema"""

        # Generate intelligent schema
        schema = self._generate_intelligent_schema(config)

        # Generate template content
        template_content = self._generate_template_content(config)

        # Add intelligence metadata as comments
        intelligence_info = f"""
<!-- Section Intelligence Info:
Type: {config.type}
Intelligence Score: {config.intelligence_config.get('intelligence_score', 0)}/100
Settings: {len(config.settings)} total ({len([s for s in config.settings if s.get('category') == 'essential'])} essential)
Blocks: {len(config.blocks)} available
-->

"""

        # Combine schema and template
        liquid_content = f"""{intelligence_info}{{%- capture section_settings -%}}
{json.dumps(schema, indent=2)}
{{% endcapture -%}}

<script type="application/json" data-section-type="{config.type}" data-section-settings>
  {{{{ section_settings | raw }}}}
</script>

{template_content}"""

        return liquid_content

    def _generate_intelligent_schema(self, config: SectionConfig) -> Dict:
        """Generate intelligent schema with organized settings"""

        # Organize settings by category for better UX
        essential_settings = [s for s in config.settings if s.get('category') == 'essential']
        recommended_settings = [s for s in config.settings if s.get('category') == 'recommended']
        advanced_settings = [s for s in config.settings if s.get('category') == 'advanced']

        # Create schema with organized settings
        schema = {
            "name": config.name,
            "tag": f"section-{config.type}",
            "class": f"section-{config.type}",
            "settings": essential_settings + recommended_settings,
            "blocks": config.blocks,
            "presets": [
                {
                    "name": config.name,
                    "category": "Custom Sections",
                    "settings": self._get_preset_defaults(config.settings)
                }
            ]
        }

        # Add advanced settings as a separate section if they exist
        if advanced_settings:
            # In Shopify, we can only have one settings array, but we can organize them visually
            schema["settings"].extend(advanced_settings)

        return schema

    def _get_preset_defaults(self, settings: List[Dict]) -> Dict:
        """Get default values for presets"""
        defaults = {}
        for setting in settings:
            if 'default' in setting and setting['default'] is not None:
                defaults[setting['id']] = setting['default']
        return defaults

    def _generate_template_content(self, config: SectionConfig) -> str:
        """Generate the main template content based on section type"""

        templates = {
            'hero': self._generate_hero_template,
            'features': self._generate_features_template,
            'testimonials': self._generate_testimonials_template,
            'gallery': self._generate_gallery_template,
            'cta': self._generate_cta_template,
            'contact': self._generate_contact_template,
            'newsletter': self._generate_newsletter_template,
            'stats': self._generate_stats_template
        }

        generator = templates.get(config.type, self._generate_generic_template)
        return generator(config)

    def _generate_hero_template(self, config: SectionConfig) -> str:
        """Generate hero section template"""
        return """<section class="hero-section animate-on-scroll"
         {% if section.settings.background_image %}
         style="background-image: url('{{ section.settings.background_image | image_url: width: 1920, height: 800 }}');"
         {% endif %}>
  <div class="hero-overlay" {% if section.settings.overlay_color %}style="background-color: {{ section.settings.overlay_color }};"{% endif %}></div>
  <div class="container">
    <div class="hero-content" style="text-align: {{ section.settings.text_alignment }};">
      <h1 class="hero-title">{{ section.settings.heading_text }}</h1>
      {% if section.settings.subheading_text %}
      <p class="hero-subtitle">{{ section.settings.subheading_text }}</p>
      {% endif %}
      {% if section.settings.button_text %}
      <div class="hero-actions">
        <a href="{{ section.settings.button_url }}" class="btn btn-primary">{{ section.settings.button_text }}</a>
      </div>
      {% endif %}
    </div>
  </div>
</section>"""

    def _generate_features_template(self, config: SectionConfig) -> str:
        """Generate features section template"""
        return """<section class="features-section animate-on-scroll">
  <div class="container">
    {% if section.settings.heading %}
    <div class="section-header">
      <h2>{{ section.settings.heading }}</h2>
      {% if section.settings.subheading %}
      <p class="section-subtitle">{{ section.settings.subheading }}</p>
      {% endif %}
    </div>
    {% endif %}

    <div class="features-grid" style="grid-template-columns: repeat({{ section.settings.columns | default: 3 }}, 1fr);">
      {% for block in section.blocks %}
      <div class="feature-card">
        {% if block.settings.icon %}
        <div class="feature-icon">
          <img src="{{ block.settings.icon | image_url: width: 64, height: 64 }}" alt="Feature icon" />
        </div>
        {% endif %}
        {% if block.settings.title %}
        <h3>{{ block.settings.title }}</h3>
        {% endif %}
        {% if block.settings.description %}
        <p>{{ block.settings.description }}</p>
        {% endif %}
        {% if block.settings.link %}
        <a href="{{ block.settings.link }}" class="btn btn-outline">Learn More</a>
        {% endif %}
      </div>
      {% endfor %}
    </div>
  </div>
</section>"""

    def _generate_testimonials_template(self, config: SectionConfig) -> str:
        """Generate testimonials section template"""
        return """<section class="testimonials-section animate-on-scroll">
  <div class="container">
    {% if section.settings.heading %}
    <div class="section-header">
      <h2>{{ section.settings.heading }}</h2>
    </div>
    {% endif %}

    <div class="testimonials-grid">
      {% for block in section.blocks %}
      <div class="testimonial-card">
        {% if section.settings.show_ratings %}
        <div class="testimonial-rating">
          {% for i in (1..5) %}
          <span class="star {% if i <= block.settings.rating %}filled{% endif %}">★</span>
          {% endfor %}
        </div>
        {% endif %}
        <div class="testimonial-content">
          <p>"{{ block.settings.content }}"</p>
        </div>
        <div class="testimonial-author">
          {% if block.settings.avatar %}
          <div class="author-avatar">
            <img src="{{ block.settings.avatar | image_url: width: 60, height: 60 }}" alt="{{ block.settings.author }}" />
          </div>
          {% endif %}
          <div class="author-info">
            {% if block.settings.author %}
            <h4>{{ block.settings.author }}</h4>
            {% endif %}
            {% if block.settings.role %}
            <p>{{ block.settings.role }}</p>
            {% endif %}
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
</section>"""

    def _generate_generic_template(self, config: SectionConfig) -> str:
        """Generate generic section template"""
        return """<section class="custom-section animate-on-scroll">
  <div class="container">
    {% if section.settings.heading %}
    <div class="section-header">
      <h2>{{ section.settings.heading }}</h2>
      {% if section.settings.subheading %}
      <p>{{ section.settings.subheading }}</p>
      {% endif %}
    </div>
    {% endif %}

    <div class="section-content">
      {% for block in section.blocks %}
      <div class="custom-block">
        {% for setting in block.settings %}
        {% if setting.value %}
        <div class="block-item">
          <strong>{{ setting.label }}:</strong> {{ setting.value }}
        </div>
        {% endif %}
        {% endfor %}
      </div>
      {% endfor %}
    </div>
  </div>
</section>"""

    def _generate_css(self, config: SectionConfig) -> str:
        """Generate CSS for the section"""

        css_templates = {
            'hero': self._generate_hero_css,
            'features': self._generate_features_css,
            'testimonials': self._generate_testimonials_css,
            'gallery': self._generate_gallery_css,
            'cta': self._generate_cta_css,
            'contact': self._generate_contact_css,
            'newsletter': self._generate_newsletter_css,
            'stats': self._generate_stats_css
        }

        generator = css_templates.get(config.type, self._generate_generic_css)
        return generator(config)

    def _generate_hero_css(self, config: SectionConfig) -> str:
        """Generate hero section CSS"""
        return """.hero-section {
  position: relative;
  min-height: {{ section.settings.height | default: 500 }}px;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  color: {{ section.settings.text_color | default: '#ffffff' }};
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}"""

    def _generate_features_css(self, config: SectionConfig) -> str:
        """Generate features section CSS"""
        return """.features-section {
  padding: 4rem 0;
  background-color: {{ section.settings.background_color | default: '#ffffff' }};
}

.features-grid {
  display: grid;
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #111827;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}"""

    def _generate_testimonials_css(self, config: SectionConfig) -> str:
        """Generate testimonials section CSS"""
        return """.testimonials-section {
  padding: 4rem 0;
  background-color: {{ section.settings.background_color | default: '#f9fafb' }};
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.testimonial-rating {
  margin-bottom: 1rem;
}

.star {
  color: #d1d5db;
  font-size: 1.25rem;
}

.star.filled {
  color: #fbbf24;
}

.testimonial-content p {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #374151;
  font-style: italic;
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info h4 {
  margin-bottom: 0.25rem;
  color: #111827;
}

.author-info p {
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}"""

    def _generate_generic_css(self, config: SectionConfig) -> str:
        """Generate generic section CSS"""
        return """.custom-section {
  padding: 4rem 0;
  background-color: {{ section.settings.background_color | default: '#ffffff' }};
}

.section-content {
  margin-top: 3rem;
}

.custom-block {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.block-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.block-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}"""

    def _generate_js(self, config: SectionConfig) -> str:
        """Generate JavaScript for the section"""

        js_templates = {
            'hero': self._generate_hero_js,
            'testimonials': self._generate_testimonials_js,
            'gallery': self._generate_gallery_js,
            'contact': self._generate_contact_js,
            'newsletter': self._generate_newsletter_js,
            'stats': self._generate_stats_js
        }

        generator = js_templates.get(config.type, self._generate_generic_js)
        return generator(config)

    def _generate_hero_js(self, config: SectionConfig) -> str:
        """Generate hero section JavaScript"""
        return """// Hero Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const heroSection = document.querySelector('.hero-section');

  if (heroSection) {
    // Parallax effect if enabled
    {% if section.settings.parallax_effect %}
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;
      heroSection.style.transform = `translateY(${parallax}px)`;
    });
    {% endif %}

    // Animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    });

    observer.observe(heroSection);
  }
});"""

    def _generate_testimonials_js(self, config: SectionConfig) -> str:
        """Generate testimonials section JavaScript"""
        return """// Testimonials Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const testimonialsContainer = document.querySelector('.testimonials-grid');

  if (testimonialsContainer && {{ section.settings.autoplay | default: true }}) {
    let currentIndex = 0;
    const testimonials = testimonialsContainer.children;
    const interval = 5000; // 5 seconds

    function showNextTestimonial() {
      testimonials[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % testimonials.length;
      testimonials[currentIndex].classList.add('active');
    }

    // Auto-rotate testimonials
    setInterval(showNextTestimonial, interval);

    // Add click handlers for manual navigation if needed
    testimonials.forEach((testimonial, index) => {
      testimonial.addEventListener('click', () => {
        testimonials[currentIndex].classList.remove('active');
        currentIndex = index;
        testimonials[currentIndex].classList.add('active');
      });
    });
  }
});"""

    def _generate_generic_js(self, config: SectionConfig) -> str:
        """Generate generic section JavaScript"""
        return """// Generic Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const section = document.querySelector('.custom-section');

  if (section) {
    // Add animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    });

    observer.observe(section);
  }
});"""

    def save_section(self, generated_section: GeneratedSection, section_name: str):
        """Save generated section files"""

        # Create sections directory if it doesn't exist
        sections_dir = self.theme_path / "sections"
        sections_dir.mkdir(exist_ok=True)

        # Save liquid file
        liquid_file = sections_dir / f"{section_name}.liquid"
        with open(liquid_file, 'w', encoding='utf-8') as f:
            f.write(generated_section.liquid_content)

        # Save CSS file
        css_file = sections_dir / f"{section_name}.css"
        with open(css_file, 'w', encoding='utf-8') as f:
            f.write(generated_section.css_content)

        # Save JS file if needed
        if generated_section.js_content:
            js_file = sections_dir / f"{section_name}.js"
            with open(js_file, 'w', encoding='utf-8') as f:
                f.write(generated_section.js_content)

        print(f"✅ Section '{section_name}' generated successfully!")
        print(f"   📁 Files created: {liquid_file}, {css_file}" + (f", {js_file}" if generated_section.js_content else ""))

def main():
    """Main function to run the section generator"""
    parser = argparse.ArgumentParser(
        description='AI-Powered Shopify Section Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python section-generator.py --name hero-banner --type hero --description "Main homepage hero section"
  python section-generator.py --name features-grid --type features --advanced
  python section-generator.py --name testimonials-carousel --type testimonials --no-advanced

Section Types:
  hero         - Hero/banner section for homepage
  features     - Features/benefits section
  testimonials - Customer testimonials section
  gallery      - Image gallery section
  cta          - Call-to-action section
  contact      - Contact form section
  newsletter   - Newsletter signup section
  stats        - Statistics/numbers section
        """
    )
    parser.add_argument('--name', required=True, help='Section name (e.g., hero-banner)')
    parser.add_argument('--type', required=True, help='Section type (see examples below)')
    parser.add_argument('--description', help='Section description')
    parser.add_argument('--theme-path', default='shopify-theme', help='Path to theme directory')
    parser.add_argument('--advanced', action='store_true', default=True, help='Include advanced settings (default: true)')
    parser.add_argument('--no-advanced', action='store_false', dest='advanced', help='Exclude advanced settings')

    args = parser.parse_args()

    # Validate section type
    valid_types = ['hero', 'features', 'testimonials', 'gallery', 'cta', 'contact', 'newsletter', 'stats']
    if args.type not in valid_types:
        print(f"❌ Invalid section type '{args.type}'. Valid types: {', '.join(valid_types)}")
        return 1

    generator = SectionGenerator(args.theme_path)

    try:
        # Show intelligence info before generating
        analyzer = SectionTypeAnalyzer()
        analysis = analyzer.analyze_section_type(args.type)

        print(f"🎯 Generating {args.type} section: '{args.name}'")
        print(f"📊 Intelligence Score: {analysis.get('intelligence_score', 0)}/100")
        print(f"⚙️  Settings: {len(analysis.get('intelligent_settings', {}).get('essential', []))} essential, {len(analysis.get('intelligent_settings', {}).get('recommended', []))} recommended")
        if args.advanced:
            advanced_count = len(analysis.get('intelligent_settings', {}).get('advanced', []))
            print(f"🔧 Advanced Settings: {advanced_count}")
        print(f"🧩 Blocks: {len(analysis.get('suggested_blocks', []))}")

        if analysis.get('optimization_tips'):
            print(f"\n💡 Optimization Tips:")
            for tip in analysis['optimization_tips'][:3]:  # Show first 3 tips
                print(f"   • {tip}")

        generated_section = generator.generate_section(
            args.name,
            args.type,
            args.description,
            use_advanced=args.advanced
        )

        generator.save_section(generated_section, args.name)

        print(f"\n✅ Section '{args.name}' generated successfully!")
        print(f"📁 Files created in: {args.theme_path}/sections/")

        # Show next steps
        print(f"\n🚀 Next Steps:")
        print(f"   1. Review and customize the generated files")
        print(f"   2. Add the section to your theme's templates")
        print(f"   3. Test in Shopify theme editor")
        if analysis.get('commonUseCases'):
            print(f"   4. Perfect for: {', '.join(analysis['commonUseCases'][:3])}")

    except Exception as e:
        print(f"❌ Error generating section: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())