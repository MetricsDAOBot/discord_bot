import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from'discord.js';
import axios from '../services/axios';
import { deleteReplyInteractionAfterSeconds } from "../utils/common";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('is_bak_kut_teh_pepper_soup')
		.setDescription('Bak Kut Teh!'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            
            let statements = [
                "Bak kut teh is not pepper soup.",
                "Don't confuse bak kut teh with pepper soup.",
                "Bak kut teh has its own identity—it's not pepper soup.",
                "Just to clarify: bak kut teh is not pepper soup.",
                "Pepper soup is not bak kut teh, and bak kut teh is not pepper soup.",
                "They're two different dishes entirely.",
                "One word: different.",
                "Bak kut teh is herbal, not just peppery.",
                "Calling bak kut teh pepper soup is like calling ramen chicken broth.",
                "Nope, bak kut teh isn't pepper soup.",
                "That herbal aroma? Not from pepper.",
                "It's more than just pepper—it's a culture.",
                "Pepper soup lacks bak kut teh's herbal complexity.",
                "Herbal pork soup is not pepper explosion.",
                "Try both, but don't mix them up.",
                "Bak kut teh isn't your average spicy broth.",
                "Pepper is just one note; bak kut teh is a whole symphony.",
                "Pepper soup doesn't steep in Chinese herbs like bak kut teh.",
                "There are levels to this soup game.",
                "No, seriously, they're not the same.",
                "One is rooted in Hokkien and Teochew traditions.",
                "Bak kut teh is about balance, not just spice.",
                "Saying they're the same is culinary slander.",
                "They might both be soupy, but that's where the similarities end.",
                "Do you call pho beef water? No? Then don't do this.",
                "Pepper alone does not a bak kut teh make.",
                "Let's respect the broth.",
                "Bak kut teh is a heritage dish.",
                "Not all soups are created equal.",
                "There's no dang gui in pepper soup.",
                "Pepper soup doesn't come with youtiao.",
                "Don't insult bak kut teh like that.",
                "Imagine calling pizza flatbread with ketchup—that's how this feels.",
                "Spicy does not mean bak kut teh.",
                "Bak kut teh is a medicinal meal, not heat.",
                "Pepper soup is straightforward. Bak kut teh is a journey.",
                "You can't reduce bak kut teh to pepper.",
                "Not even close.",
                "It's soup, but it's not that soup.",
                "Pepper soup is a different cuisine altogether.",
                "Don't oversimplify bak kut teh.",
                "It's a broth of tradition, not just spice.",
                "Teochew or Hokkien versions vary—but neither is pepper soup.",
                "There's no bak kut teh in a peppercorn shaker.",
                "Bak kut teh uses dang shen, not just pepper.",
                "One warms you with spice; the other heals you with herbs.",
                "Pepper soup didn't come from Klang.",
                "You wouldn't say sushi is just raw fish, would you?",
                "Don't disrespect the pig rib like that.",
                "Bak kut teh is layered.",
                "It's herbal, not pepper-loaded.",
                "Pepper soup can't stand up to bak kut teh's depth.",
                "Even your grandma would disagree.",
                "It's not just hot—it's wholesome.",
                "That's like calling espresso bitter water.",
                "Pepper soup is bold. Bak kut teh is wise.",
                "Not all that is hot is pepper soup.",
                "Herbs matter.",
                "You need more than pepper to make bak kut teh.",
                "Soup is not soup.",
                "Respect the soup lineage.",
                "Just because it's in a bowl doesn't mean it's the same.",
                "Bak kut teh is a culture, not just a recipe.",
                "The roots are different.",
                "It's like calling katsu curry gravy rice.",
                "Pepper soup doesn't have goji berries.",
                "Bak kut teh is slow-cooked mastery.",
                "Pepper soup is spice; bak kut teh is soul.",
                "There's a reason it's called meat bone tea.",
                "Bak kut teh nourishes. Pepper soup burns.",
                "One simmers with love; the other stings.",
                "Pepper soup is fire; bak kut teh is warmth.",
                "They don't even smell the same.",
                "Bak kut teh has layers.",
                "It's soup—but it's not that soup.",
                "Would you call laksa noodle curry? No.",
                "One hugs you, one punches you.",
                "Don't mix traditions.",
                "Pepper soup is about heat. Bak kut teh is about healing.",
                "Pepper soup wakes you up. Bak kut teh comforts you.",
                "They're on different continents, both literally and taste-wise.",
                "Bak kut teh is health in a bowl.",
                "You wouldn't say congee is oatmeal.",
                "Don't reduce it to just peppery.",
                "That's like saying stew is just thick soup.",
                "It's herbal, not peppery by design.",
                "Bak kut teh feeds your chi.",
                "It's not a spicy broth—it's a cultural heirloom.",
                "It's medicine that tastes amazing.",
                "No chili required.",
                "Bak kut teh is Malaysia; Singapore can only hope for tasty bak kut teh.",
                "You'll never confuse them after one taste.",
                "Bak kut teh doesn't need pepper to shine.",
                "It's not about the burn—it's about the brew.",
                "Calling it pepper soup is like calling nasi lemak rice with stuff.",
                "Bottom line: Bak kut teh is not pepper soup."
            ];

            let randomStatement = Math.floor((Math.random() - 0.000001) * 101);
            if(randomStatement < 0) {
                randomStatement = 0;
            }

            if(randomStatement > statements.length - 1) {
                randomStatement = statements.length - 1;
            }

            await interaction.reply({ content: statements[randomStatement] });
        }

        catch (e){
        }
	},
};